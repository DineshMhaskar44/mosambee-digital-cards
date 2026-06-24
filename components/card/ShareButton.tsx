"use client";

import { Share2, Check, Copy } from "lucide-react";
import { useState } from "react";
import { cardUrl } from "@/lib/utils";
import type { Employee } from "@/types";

export function ShareButton({ employee }: { employee: Employee }) {
  const [copied, setCopied] = useState(false);
  const url = `${cardUrl(employee.employee_id)}?ref=share`;

  async function handleShare() {
    if (typeof navigator.share !== "undefined") {
      try {
        await navigator.share({
          title: `${employee.full_name} — Mosambee`,
          text:  `Connect with ${employee.full_name}, ${employee.designation} at Mosambee`,
          url,
        });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center
                 text-white hover:bg-white/30 transition-all active:scale-95"
      aria-label="Share card"
    >
      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
    </button>
  );
}
