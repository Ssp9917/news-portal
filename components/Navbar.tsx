"use client";

import Link from "next/link";
import { NAV_CATEGORY_SLUGS } from "@/lib/i18n/categories";
import { useI18n } from "@/components/providers/i18n-provider";
import { withLocale } from "@/lib/i18n/paths";

export default function Navbar() {
  const { locale, t } = useI18n();

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white transition-colors dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container mx-auto max-w-7xl overflow-x-auto px-4">
        <div className="mb-0.5 flex h-12 items-center space-x-6 text-xs font-medium tracking-wide text-gray-600 dark:text-neutral-300 md:space-x-8">
          {NAV_CATEGORY_SLUGS.map((slug) => {
            const href =
              slug === "home"
                ? withLocale(locale, "/")
                : withLocale(locale, `/category/${slug}`);
            const label = t(`categories.${slug}`);
            return (
              <Link
                key={slug}
                href={href}
                className="whitespace-nowrap border-b-2 border-transparent py-3 uppercase transition-colors hover:border-[#D32F2F] hover:text-[#D32F2F]"
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
