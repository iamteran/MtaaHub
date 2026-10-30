import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** size of the square mark in px */
  size?: number;
  /** show the "MtaaHub" wordmark + tagline */
  withWordmark?: boolean;
  variant?: "dark" | "light";
}

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[26%] bg-primary-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none">
        <path
          d="M24 8.5c-4.7 0-8.5 3.7-8.5 8.2 0 6 7.6 14.4 8.1 15a.6.6 0 0 0 .9 0c.5-.6 8.1-9 8.1-15 0-4.5-3.8-8.2-8.6-8.2Z"
          fill="#ffffff"
        />
        <path
          d="M24 18.6l-4.6 3.6v5.2h3v-3.4h3.2v3.4h3v-5.2L24 18.6Z"
          fill="#0B6B45"
        />
      </svg>
    </span>
  );
}

export function Logo({ className, size = 40, withWordmark = true, variant = "dark" }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[22px] font-extrabold tracking-tight",
              variant === "dark" ? "text-ink-900" : "text-white"
            )}
          >
            MtaaHub
          </span>
          <span
            className={cn(
              "mt-1 text-[9.5px] font-medium uppercase tracking-[0.22em]",
              variant === "dark" ? "text-ink-400" : "text-primary-200/80"
            )}
          >
            Connect · Compare · Thrive
          </span>
        </span>
      )}
    </span>
  );
}
