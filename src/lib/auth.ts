import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
});

const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    // JWT sessions keep middleware on the Edge runtime (no Prisma there).
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    newUser: "/auth/welcome",
  },
  providers: [
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase().trim() },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          displayName: user.displayName ?? user.name ?? user.email,
          role: user.role,
          createdAt: user.createdAt,
        };
      },
    }),
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: { params: { scope: "openid email profile", prompt: "consent" } },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              googleId: account.providerAccountId,
              image: user.image ?? existing.image,
              lastLoginAt: new Date(),
            },
          });
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role ?? "USER";
        token.displayName = user.displayName ?? user.name ?? "User";
        token.createdAt = user.createdAt;
      }
      if (account) {
        token.provider = account.provider;
      }
      if (!token.role) token.role = "USER";
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? token.sub ?? "";
        session.user.role = (token.role as string) ?? "USER";
        session.user.displayName = (token.displayName as string) ?? session.user.name ?? "User";
        session.user.createdAt = token.createdAt as Date | undefined;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await prisma.user.update({
        where: { id: user.id },
        data: { displayName: user.name ?? user.email?.split("@")[0] ?? "User" },
      });
    },
  },
  debug: false,
});
