"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/assets/Logo-01.png";
import Image from "next/image";
import { useI18n } from "@/components/providers/i18n-provider";
import { withLocale } from "@/lib/i18n/paths";
import { localeToBcp47 } from "@/lib/date-locale";
import type { Locale } from "@/lib/i18n/config";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const { locale, t } = useI18n();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `${withLocale(locale, "/search")}?q=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  const currentDate = new Date().toLocaleDateString(
    localeToBcp47(locale as Locale),
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ── Top utility bar ── */}
      <div className="bg-[#0f172a] dark:bg-black">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
          {/* Live dot + date */}
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <time
              dateTime={new Date().toISOString()}
              className="text-[11px] font-medium tracking-wide text-slate-400"
            >
              {currentDate}
            </time>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <div className="mx-1 h-3.5 w-px bg-slate-700" />
            <LocaleSwitcher />
            <div className="mx-1 h-3.5 w-px bg-slate-700" />
            <Link
              href="/admin"
              className="hidden items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-400 transition-colors hover:bg-white/5 hover:text-white sm:flex"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main header ── */}
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="container mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:gap-8">

          {/* Logo + Brand */}
          <Link
            href={withLocale(locale, "/")}
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg shadow-sm ring-1 ring-slate-200 transition-shadow group-hover:shadow-md dark:ring-neutral-800">
              <Image
                src={Logo}
                alt={t("site.brandTitle")}
                width={40}
                height={40}
                priority
                className="object-contain"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-black tracking-tight text-slate-900 transition-colors group-hover:text-[#D32F2F] dark:text-white"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {t("site.brandTitle")}
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-500">
                {t("site.brandTagline")}
              </span>
            </div>
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="relative w-full max-w-sm flex-1"
          >
            <div
              className={`flex items-center rounded-full border transition-all duration-200 ${
                isFocused
                  ? "border-[#D32F2F] bg-white shadow-[0_0_0_3px_rgba(211,47,47,0.1)] dark:bg-neutral-900"
                  : "border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-900"
              }`}
            >
              <button
                type="submit"
                className={`flex h-9 w-10 shrink-0 items-center justify-center pl-3 transition-colors ${
                  isFocused ? "text-[#D32F2F]" : "text-slate-400"
                }`}
                aria-label="Search"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={t("nav.searchPlaceholder")}
                className="h-9 w-full bg-transparent pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none dark:text-neutral-100 dark:placeholder-neutral-500"
                aria-label={t("nav.searchPlaceholder")}
              />
            </div>
          </form>

          {/* Admin Panel — desktop */}
          <div className="hidden shrink-0 md:block">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-[#D32F2F] hover:text-[#D32F2F] dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-[#D32F2F] dark:hover:text-[#D32F2F]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t("nav.adminPanel")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}