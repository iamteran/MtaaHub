'use client'

import Link from "next/link";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AuthErrorFormProps {
  error: string
}

const errorMessages: Record<string, { title: string; description: string; action?: string }> = {
  Configuration: {
    title: "Configuration Error",
    description: "There is a problem with the server configuration. Please contact support.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You don't have permission to sign in. This could be due to account restrictions.",
  },
  Verification: {
    title: "Verification Failed",
    description: "The verification link has expired or has already been used. Please request a new one.",
  },
  OAuthSignin: {
    title: "Sign In Error",
    description: "Error starting the sign-in process. Please try again.",
  },
  OAuthCallback: {
    title: "Callback Error",
    description: "Error completing the sign-in process. Please try again.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    description: "Could not create your account. Please try again or contact support.",
  },
  EmailCreateAccount: {
    title: "Email Account Error",
    description: "Could not create email account. Please try again.",
  },
  Callback: {
    title: "Callback Error",
    description: "Error in the sign-in callback. Please try again.",
  },
  EmailSignin: {
    title: "Email Sign In Error",
    description: "Error sending the sign-in link. Please try again.",
  },
  CredentialsSignin: {
    title: "Invalid Credentials",
    description: "The email or password you entered is incorrect. Please try again.",
  },
  Default: {
    title: "Sign In Error",
    description: "An unexpected error occurred. Please try again or contact support if the problem persists.",
  },
};

export function AuthErrorForm({ error }: AuthErrorFormProps) {
  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted-50">
      <Card variant="elevated" className="w-full max-w-md p-8 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-muted-900 mb-2">{errorInfo.title}</h1>
        <p className="text-muted-600 mb-8">{errorInfo.description}</p>

        <div className="flex flex-col gap-3">
          <Button variant="primary" onClick={() => window.history.back()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <a href="/auth/signin" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-muted-600 hover:bg-muted-100 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </a>
          <a href="/" className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-muted-600 hover:bg-muted-100 transition-colors">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </a>
        </div>

        <p className="mt-6 text-sm text-muted-500">
          If this persists, please{" "}
          <Link href="/contact" className="text-primary-600 hover:underline">
            contact support
          </Link>
        </p>
      </Card>
    </div>
  );
}