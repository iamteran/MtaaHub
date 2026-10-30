import type { Metadata } from "next";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to MtaaHub to manage listings, jobs and services.",
};

export const dynamic = "force-dynamic";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string; error?: string; mode?: string; registered?: string };
}) {
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <SignInForm
      callbackUrl={searchParams.callbackUrl ?? "/dashboard"}
      error={searchParams.error}
      registered={Boolean(searchParams.registered)}
      mode={searchParams.mode === "signup" ? "signup" : "signin"}
      googleEnabled={googleEnabled}
    />
  );
}
