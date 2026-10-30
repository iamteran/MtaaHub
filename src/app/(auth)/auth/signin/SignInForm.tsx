"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { registerUser } from "@/app/actions";
import { Logo } from "@/components/brand/logo";

type Props = {
  callbackUrl: string;
  error?: string;
  registered?: boolean;
  mode: "signin" | "signup";
  googleEnabled: boolean;
};

export function SignInForm({ callbackUrl, error, registered, mode, googleEnabled }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const isSignup = mode === "signup";

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    if (!email || !password) {
      setFormError("Enter both your email and password.");
      return;
    }
    setLoading(true);
    setFormError("");

    const result = await signIn("credentials", { email, password, redirect: false });

    if (!result || result.error) {
      setFormError("That email and password combination did not work.");
      setLoading(false);
      return;
    }

    router.push(callbackUrl || "/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center">
            <Logo size={44} />
          </Link>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-ink-900">
            {isSignup ? "Create your free account" : "Welcome back"}
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-600">
            {isSignup ? "Join thousands of Kenyans finding homes, jobs and services." : "Sign in to manage your listings, jobs and services."}
          </p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
          {registered && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 p-3 text-[12.5px] text-primary-800">
              <CheckCircle2 className="h-4 w-4" /> Account created. Sign in below.
            </div>
          )}
          {(error || formError) && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-[12.5px] text-red-700" role="alert">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {formError || error}
            </div>
          )}

          {isSignup ? (
            <form action={registerUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Full name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input id="name" name="name" required placeholder="Brian Mwangi" className="input-base pl-9" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input id="email" name="email" type="email" required placeholder="you@example.com" className="input-base pl-9" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="input-base pl-9"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary-700 text-sm font-semibold text-white transition-colors hover:bg-primary-800"
              >
                Create account
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-base pl-9"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-[12.5px] font-semibold text-ink-800">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="input-base pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-ink-400 hover:text-ink-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-700 text-sm font-semibold text-white transition-colors hover:bg-primary-800 disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign in
              </button>
            </form>
          )}

          {googleEnabled && (
            <>
              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-ink-100" />
                <span className="text-[10.5px] font-medium uppercase tracking-wider text-ink-400">or</span>
                <span className="h-px flex-1 bg-ink-100" />
              </div>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl })}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-ink-200 text-sm font-semibold text-ink-800 hover:bg-ink-50"
              >
                Continue with Google
              </button>
            </>
          )}

          <p className="mt-5 text-center text-[12.5px] text-ink-600">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Link href="/auth/signin" className="font-semibold text-primary-700 hover:underline">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to MtaaHub?{" "}
                <Link href="/auth/signin?mode=signup" className="font-semibold text-primary-700 hover:underline">
                  Create an account
                </Link>
              </>
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-ink-400">
          By continuing you agree to our community rules. MtaaHub is free for everyone.
        </p>
      </div>
    </div>
  );
}
