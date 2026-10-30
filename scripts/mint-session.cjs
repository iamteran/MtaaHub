/* Mint a NextAuth JWT session cookie for local visual verification. */
const { encode } = require("next-auth/jwt");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config?.();

const prisma = new PrismaClient();

(async () => {
  const user = await prisma.user.findUnique({ where: { email: "admin@mtaahub.co.ke" } });
  if (!user) throw new Error("admin user missing");

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET missing");

  const token = await encode({
    secret,
    token: {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      picture: user.image,
    },
    maxAge: 60 * 60 * 2,
  });

  console.log(token);
  await prisma.$disconnect();
})();
