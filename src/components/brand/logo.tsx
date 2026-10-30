import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** size of the square mark in px */
  size?: number;
  /** show the "MtaaHub" wordmark + tagline */
  withWordmark?: boolean;
  variant?: "dark" | "light";
}

/**
 * MtaaHub mark: a location pin fused with a house on a gradient tile.
 * Reads at 16px (favicon) and at 96px (marketing) without extra detail.
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none" role="presentation">
        <defs>
          <linearGradient id="mtaa-tile" x1="4" y1="2" x2="44" y2="47" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1AB57B" />
            <stop offset="0.55" stopColor="#0F8A56" />
            <stop offset="1" stopColor="#07543A" />
          </linearGradient>
          <linearGradient id="mtaa-sheen" x1="24" y1="0" x2="24" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect width="48" height="48" rx="13" fill="url(#mtaa-tile)" />
        <path
          d="M0 13C0 5.8 5.8 0 13 0h22c7.2 0 13 5.8 13 13v1.4C36 8.2 12 8.2 0 14.4V13Z"
          fill="url(#mtaa-sheen)"
        />

        {/* hub orbit */}
        <circle cx="24" cy="20.5" r="14.2" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.4" />

        {/* pin */}
        <path
          d="M24 6.6c-5.35 0-9.7 4.28-9.7 9.56 0 6.95 8.55 15.6 9.25 16.33a.62.62 0 0 0 .9 0c.7-.73 9.25-9.38 9.25-16.33 0-5.28-4.35-9.56-9.7-9.56Z"
          fill="#ffffff"
        />

        {/* house in negative space */}
        <path d="M24 10.4l-7.2 5.6h14.4L24 10.4Z" fill="#0A6A46" />
        <path d="M19.5 15.9h9v6.2h-9V15.9Z" fill="#0A6A46" />
        <path d="M22.85 18.1h2.3v4h-2.3v-4Z" fill="#ffffff" />
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
              "font-display text-[22px] font-extrabold tracking-[-0.03em]",
              variant === "dark" ? "text-ink-900" : "text-white"
            )}
          >
            Mtaa<span className={variant === "dark" ? "text-primary-700" : "text-primary-300"}>Hub</span>
          </span>
          <span
            className={cn(
              "mt-1 text-[9px] font-semibold uppercase tracking-[0.24em]",
              variant === "dark" ? "text-ink-400" : "text-primary-200/70"
            )}
          >
            Connect · Compare · Thrive
          </span>
        </span>
      )}
    </span>
  );
}
