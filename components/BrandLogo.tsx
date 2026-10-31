"use client";

import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider";
import { withLocale } from "@/lib/i18n/paths";

interface BrandLogoProps {
  variant?: "header" | "footer" | "admin";
  className?: string;
}

export default function BrandLogo({
  variant = "header",
  className = "",
}: BrandLogoProps) {
  const { locale } = useI18n();

  const isHeader = variant === "header";
  const isFooter = variant === "footer";

  return (
    <Link
      href={withLocale(locale, "/")}
      aria-label="Bharat Pulse - भारत पल्स होम"
      className={`group flex items-center gap-2.5 transition-all select-none ${className}`}
    >
      {/* ── Geometric Emblem ── */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9a1418] via-[#c61d23] to-[#ef4444] text-white shadow-md shadow-red-900/30 ring-2 ring-white/25 group-hover:scale-105 group-hover:ring-white/50 transition-all duration-300">
        {/* SVG Pulse & Quill Emblem */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-white"
        >
          {/* Signal / Pulse wave radiating from center pillar */}
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1" />
          <path d="M4 9s1-1 4-1 5 2 8 2 4-1 4-1" />
          <circle cx="12" cy="12" r="3" className="fill-white" />
          <path d="M12 3v3" />
          <path d="M12 18v3" />
        </svg>

        {/* Live glowing beacon */}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300 ring-1 ring-white" />
        </span>
      </div>

      {/* ── Brand Typography ── */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-xl font-black tracking-tight ${
              isHeader
                ? "text-white"
                : isFooter
                ? "text-white"
                : "text-slate-900 dark:text-white"
            }`}
            style={{
              fontFamily:
                "var(--font-noto-serif-devanagari), 'Cinzel', Georgia, serif",
              letterSpacing: "-0.02em",
            }}
          >
            BHARAT
          </span>
          <span
            className={`text-xl font-black italic tracking-tight ${
              isHeader ? "text-amber-300" : "text-[#c61d23]"
            }`}
            style={{
              fontFamily:
                "var(--font-noto-serif-devanagari), Georgia, serif",
            }}
          >
            PULSE
          </span>

          <span
            className={`hidden sm:inline-block rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${
              isHeader
                ? "bg-black/30 text-white/90 border border-white/20"
                : "bg-red-500/10 text-[#c61d23] dark:text-red-400 border border-red-500/20"
            }`}
          >
            NEWS
          </span>
        </div>

        {/* Tagline */}
        <span
          className={`mt-1 text-[10px] font-bold tracking-wider uppercase ${
            isHeader
              ? "text-white/80"
              : isFooter
              ? "text-slate-400"
              : "text-slate-500 dark:text-slate-400"
          }`}
          style={{
            fontFamily: "var(--font-noto-sans-devanagari), sans-serif",
            letterSpacing: "0.08em",
          }}
        >
          {locale === "hi"
            ? "भारत पल्स • राष्ट्र की आवाज़"
            : "Voice of the Nation • 24x7"}
        </span>
      </div>
    </Link>
  );
}
