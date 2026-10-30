import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const SOCIALS = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M13.5 21v-7.5h2.5l.4-2.9h-2.9V8.7c0-.8.2-1.4 1.4-1.4h1.6V4.7c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2h-2.5v2.9h2.5V21h3.2Z",
  },
  {
    label: "X",
    href: "https://x.com",
    path: "M17.3 4h2.9l-6.3 7.2L21 20h-5.6l-4.4-5.8L6 20H3l6.7-7.7L3.3 4h5.7l4 5.3L17.3 4Zm-1 14.3h1.6L7.8 5.6H6.1l10.2 12.7Z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    path: "M21.6 8.2a2.5 2.5 0 0 0-1.8-1.8C18.2 6 12 6 12 6s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 8.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 3.8 2.5 2.5 0 0 0 1.8 1.8C5.8 18 12 18 12 18s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-3.8ZM10 15V9l5.2 3-5.2 3Z",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    path: "M16.6 3h-3v11.3a2.6 2.6 0 1 1-2.2-2.6V8.6a5.8 5.8 0 1 0 5.2 5.7V8.8a6.6 6.6 0 0 0 3.9 1.3V7a3.8 3.8 0 0 1-3.9-4Z",
  },
];

export function Footer() {
  return (
    <footer className="border-t-4 border-primary-600 bg-primary-900 text-white">
      <div className="container-main">
        <div className="flex flex-col items-center justify-between gap-8 py-9 md:flex-row">
          <Link href="/" aria-label="MtaaHub home" className="flex items-center">
            <Logo size={46} variant="light" />
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-primary-100/80">Follow Us:</span>
            <div className="flex items-center gap-2.5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <p className="text-sm font-medium text-primary-100/90">
            Built for a better Kenya <span aria-hidden="true">🇰🇪</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
