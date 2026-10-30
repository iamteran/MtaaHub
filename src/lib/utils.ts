import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------- */
/*  Money — stored as whole Kenyan shillings (Int), never cents               */
/* -------------------------------------------------------------------------- */

export function formatKSH(amount: number | null | undefined, opts?: { compact?: boolean }): string {
  const value = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  if (opts?.compact && Math.abs(value) >= 1_000_000) {
    return `KSh ${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (opts?.compact && Math.abs(value) >= 10_000) {
    return `KSh ${Math.round(value / 1_000)}K`;
  }
  return `KSh ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(value)}`;
}

/** @deprecated use formatKSH */
export const formatKES = formatKSH;

export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-KE").format(value ?? 0);
}

export function parseKSH(input: string): number {
  const cleaned = input.replace(/[^0-9.]/g, "");
  const value = parseFloat(cleaned);
  return Number.isFinite(value) ? Math.round(value) : 0;
}

/* -------------------------------------------------------------------------- */
/*  Dates                                                                      */
/* -------------------------------------------------------------------------- */

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "";
  const then = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - then.getTime()) / 1000);
  if (Number.isNaN(seconds)) return "";
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1h ago" : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return then.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

/* -------------------------------------------------------------------------- */
/*  Strings                                                                    */
/* -------------------------------------------------------------------------- */

export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* -------------------------------------------------------------------------- */
/*  Phones (Kenya)                                                             */
/* -------------------------------------------------------------------------- */

export function isValidKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, "").replace(/^\+254/, "0");
  return /^0[17]\d{8}$/.test(cleaned);
}

export function formatKenyanPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/^\+254/, "0");
  if (/^0[17]\d{8}$/.test(cleaned)) {
    return `+254 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

/* -------------------------------------------------------------------------- */
/*  Kenya geography                                                            */
/* -------------------------------------------------------------------------- */

export const KENYAN_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita-Taveta", "Garissa", "Wajir",
  "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Machakos",
  "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot",
  "Samburu", "Trans-Nzoia", "Uasin Gishu", "Elgeyo-Marakwet", "Nandi", "Baringo", "Laikipia",
  "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia",
  "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira", "Nairobi",
] as const;

export const PROPERTY_TYPES = [
  "Bedsitter", "Single Room", "Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom",
  "4 Bedroom+", "Maisonette", "Bungalow", "Office", "Shop", "Warehouse",
] as const;

export const SERVICE_CATEGORIES = [
  "Electrician", "Plumber", "Carpenter", "Cleaner", "Mechanic", "Repair Technician",
  "Painter", "Welder", "Mason", "Tailor", "Hairdresser", "Other Services",
] as const;

export const JOB_CATEGORIES = [
  "Technology", "Sales", "Marketing", "Finance", "Administration", "Customer Service",
  "Driver", "Security", "Hospitality", "Education", "Healthcare", "Construction", "Other",
] as const;

/* -------------------------------------------------------------------------- */
/*  Misc                                                                       */
/* -------------------------------------------------------------------------- */

export function pct(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
