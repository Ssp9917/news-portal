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
    <header>
      <div className="bg-[#111827] py-2 text-xs text-white">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span aria-hidden="true">🕒</span>
            <time dateTime={new Date().toISOString()}>{currentDate}</time>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <ThemeToggle />
            <LocaleSwitcher />
            <Link
              href="/admin"
              className="hidden font-medium text-white/95 hover:text-white sm:inline"
            >
              {t("nav.admin")}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-100 bg-white py-4 transition-colors dark:border-neutral-800 dark:bg-neutral-950">
        <div className="container mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 md:flex-row md:justify-between">
          <Link href={withLocale(locale, "/")} className="group flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded font-bold">
              <Image src={Logo} alt={t("site.brandTitle")} width={40} height={40} priority />
            </div>
            <div className="flex flex-col text-center md:text-start">
              <span className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-[#D32F2F] dark:text-neutral-50">
                {t("site.brandTitle")}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-neutral-400">
                {t("site.brandTagline")}
              </span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="relative w-full md:w-1/3">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("nav.searchPlaceholder")}
              className="w-full rounded-md border border-transparent bg-gray-100 py-2 pl-10 pr-4 text-sm text-gray-900 outline-none ring-[#D32F2F] transition focus:bg-white focus:ring-2 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:bg-neutral-950"
              aria-label={t("nav.searchPlaceholder")}
            />
            <button
              type="submit"
              className="absolute left-3 top-2.5 text-gray-400 transition hover:text-[#D32F2F]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </form>

          <div className="hidden text-sm font-medium text-gray-700 dark:text-neutral-200 md:block">
            <Link href="/admin" className="transition hover:text-[#D32F2F]">
              {t("nav.adminPanel")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
