import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DeviceType } from "@/types";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format phone number for display */
export function formatPhone(phone: string): string {
  return phone.replace(/(\+\d{2})(\d{5})(\d{5})/, "$1 $2 $3");
}

/** Parse user-agent string to detect device type */
export function detectDevice(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return "mobile";
  if (ua) return "desktop";
  return "unknown";
}

/** Parse browser name from user-agent */
export function detectBrowser(userAgent: string): string {
  if (/edg\//i.test(userAgent)) return "Edge";
  if (/opr\//i.test(userAgent)) return "Opera";
  if (/chrome/i.test(userAgent)) return "Chrome";
  if (/safari/i.test(userAgent)) return "Safari";
  if (/firefox/i.test(userAgent)) return "Firefox";
  return "Other";
}

/** Parse OS from user-agent */
export function detectOS(userAgent: string): string {
  if (/windows nt/i.test(userAgent)) return "Windows";
  if (/macintosh|mac os x/i.test(userAgent)) return "macOS";
  if (/android/i.test(userAgent)) return "Android";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
  if (/linux/i.test(userAgent)) return "Linux";
  return "Other";
}

/** Generate a WhatsApp URL */
export function whatsappUrl(number: string, message = "Hello! I'd like to connect."): string {
  const cleaned = number.replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

/** Format a number with commas */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

/** Truncate text */
export function truncate(str: string, max = 50): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/** Build the public card URL for an employee */
export function cardUrl(employeeId: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://mosambee-digital-cards-nine.vercel.app";
  return `${base}/card/${employeeId}`;
}

/** Sleep helper for retry logic */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parse referrer from URL search params */
export function getReferrer(searchParams: URLSearchParams): string {
  const ref = searchParams.get("ref");
  if (ref === "qr") return "qr";
  if (ref === "share") return "share";
  return "direct";
}
