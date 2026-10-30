import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = localFont({
  src: [
    { path: "./fonts/Inter-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Inter-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Inter-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Inter-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const poppins = localFont({
  src: [
    { path: "./fonts/Poppins-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Poppins-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Poppins-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Poppins-ExtraBold.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://mtaahub.co.ke"),
  title: {
    default: "MtaaHub — Your Mtaa. Our Hub.",
    template: "%s | MtaaHub",
  },
  description:
    "Find jobs, homes, trusted services, and more — all in one place. MtaaHub is Kenya's free community platform for housing, jobs, local services, price comparison, safety and small business tools.",
  keywords: ["Kenya", "Nairobi", "housing", "jobs", "nyumba", "kazi", "local services", "price comparison", "MtaaHub"],
  authors: [{ name: "MtaaHub" }],
  creator: "MtaaHub",
  openGraph: {
    type: "website",
    locale: "en_KE",
    siteName: "MtaaHub",
    title: "MtaaHub — Your Mtaa. Our Hub.",
    description: "Find jobs, homes, trusted services, and more — all in one place. Free for everyone.",
    images: [{ url: "/images/hero-nairobi.jpg", width: 1920, height: 1440, alt: "Nairobi skyline" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MtaaHub — Your Mtaa. Our Hub.",
    description: "Find jobs, homes, trusted services, and more — all in one place.",
    images: ["/images/hero-nairobi.jpg"],
  },
  robots: { index: true, follow: true },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0B6B45",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-white font-sans text-ink-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
