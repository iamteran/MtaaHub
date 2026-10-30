'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles, ArrowRight, CheckCircle, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CONFETTI_COLORS = [
  "#22c55e", // primary-500
  "#16a34a", // primary-600
  "#f59e0b", // secondary-500
  "#3b82f6", // accent-500
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
];

interface ConfettiPiece {
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  gravity: number;
  opacity: number;
}

export function WelcomeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [animationDone, setAnimationDone] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isSettingName, setIsSettingName] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const suggestedName = session.user.displayName || session.user.name || "";
      if (suggestedName && !session.user.displayName) {
        setDisplayName(suggestedName);
        setIsSettingName(true);
      } else {
        setShowConfetti(true);
        triggerConfetti();
      }
    }
  }, [session, status]);

  const triggerConfetti = () => {
    const pieces: ConfettiPiece[] = [];
    const count = 50;

    for (let i = 0; i < count; i++) {
      pieces.push({
        x: Math.random() * window.innerWidth,
        y: -20,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: Math.random() * 8 + 6,
        rotation: Math.random() * 360,
        velocityX: (Math.random() - 0.5) * 6,
        velocityY: Math.random() * 3 + 2,
        gravity: 0.15,
        opacity: 1,
      });
    }
    setConfettiPieces(pieces);
  };

  useEffect(() => {
    if (!showConfetti) return;

    let animationFrame: number;
    const startTime = Date.now();
    const duration = 3000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        setAnimationDone(true);
        return;
      }

      setConfettiPieces((prev) =>
        prev.map((piece) => ({
          ...piece,
          x: piece.x + piece.velocityX,
          y: piece.y + piece.velocityY,
          velocityY: piece.velocityY + piece.gravity,
          rotation: piece.rotation + piece.velocityX * 0.5,
          opacity: 1 - progress,
        })).filter((piece) => piece.opacity > 0 && piece.y < window.innerHeight + 50)
      );

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [showConfetti]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (trimmed.length < 2) {
      setNameError("Name must be at least 2 characters");
      return;
    }
    if (trimmed.length > 50) {
      setNameError("Name must be less than 50 characters");
      return;
    }
    if (!/^[a-zA-Z0-9\s\-_.']+$/.test(trimmed)) {
      setNameError("Name contains invalid characters");
      return;
    }

    setNameError("");
    setIsSettingName(false);
    setShowConfetti(true);
    triggerConfetti();
  };

  const handleSkipName = () => {
    setIsSettingName(false);
    setShowConfetti(true);
    triggerConfetti();
  };

  const handleContinue = (destination: string) => {
    router.push(destination);
    router.refresh();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent mx-auto mb-4" />
          <p className="text-muted-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted-50 px-4">
        <Card variant="elevated" className="w-full max-w-md p-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-primary-600 mb-4" />
          <h1 className="text-2xl font-bold text-muted-900 mb-2">Welcome to MtaaHub!</h1>
          <p className="text-muted-600 mb-6">Please sign in to continue.</p>
          <Link href="/auth/signin">
            <Button className="w-full" size="lg">
              <Sparkles className="h-5 w-5 mr-2" />
              Sign in with Google
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const userName = session?.user?.displayName || session?.user?.name || "Friend";

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div
          className="fixed inset-0 pointer-events-none z-10"
          aria-hidden="true"
          role="img"
          aria-label="Celebration confetti"
        >
          {confettiPieces.map((piece, index) => (
            <div
              key={index}
              className="fixed"
              style={{
                left: piece.x,
                top: piece.y,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotation}deg)`,
                opacity: piece.opacity,
                borderRadius: Math.random() > 0.5 ? "50%" : "0",
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-20 w-full max-w-md text-center">
        {isSettingName ? (
          <Card variant="elevated" className="p-8 animate-fade-in">
            <div className="mb-6">
              <Sparkles className="h-12 w-12 mx-auto text-primary-600 mb-4" />
              <h1 className="text-2xl font-bold text-muted-900 mb-2">Welcome to MtaaHub!</h1>
              <p className="text-muted-600">Let&apos;s set up your profile</p>
            </div>

            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="text-left">
                <label htmlFor="displayName" className="block text-sm font-medium text-muted-700 mb-1.5">
                  Your display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={cn(
                    "input-base text-lg py-3 text-center",
                    nameError && "border-red-500 focus:ring-red-500"
                  )}
                  maxLength={50}
                  autoFocus
                  required
                />
                {nameError && (
                  <p className="mt-1.5 text-sm text-red-600" role="alert">{nameError}</p>
                )}
                <p className="mt-2 text-xs text-muted-500 text-center">
                  This is how others will see you on MtaaHub. You can change it later.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" size="lg">
                  Continue
                </Button>
                <Button type="button" variant="ghost" className="flex-1" size="lg" onClick={handleSkipName}>
                  Skip
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <>
            <div className="mb-8 animate-fade-in" style={{ animationDelay: animationDone ? "0ms" : "300ms" }}>
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-muted-900 mb-3">
                Hongera! Karibu MtaaHub!
              </h1>
              <p className="text-lg text-muted-600 mb-2">You&apos;re officially part of the community.</p>
              <p className="text-muted-500">We&apos;re glad you&apos;re here, <strong>{userName}</strong>!</p>
            </div>

            <Card variant="elevated" className="p-8 animate-slide-up" style={{ animationDelay: animationDone ? "0ms" : "600ms" }}>
              <p className="text-muted-600 mb-6">
                You can now explore MtaaHub&apos;s free services: find homes, discover jobs, connect with local
                services, compare prices, learn safety tips, manage your business, and chat with Mtaa AI.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/">
                  <Button variant="primary" size="lg" className="flex-1">
                    <Home className="h-5 w-5 mr-2" />
                    Explore MtaaHub
                  </Button>
                </Link>
                <Link href={callbackUrl}>
                  <Button variant="secondary" size="lg" className="flex-1">
                    <LayoutDashboard className="h-5 w-5 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </Card>

            <p className="mt-6 text-sm text-muted-500">
              Need help? <Link href="/help" className="text-primary-600 hover:underline">Visit our Help Center</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}