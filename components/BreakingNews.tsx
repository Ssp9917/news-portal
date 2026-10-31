"use client";

import Link from "next/link";
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { withLocale } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedTitle } from "@/lib/i18n/news-fields";

interface BreakingNewsItem {
  _id: string;
  slug?: string;
  title: string;
  titleI18n?: {
    bn?: string;
    en?: string;
    hi?: string;
  };
  isBreaking?: boolean;
}

interface BreakingNewsProps {
  news: BreakingNewsItem[];
  locale: Locale;
  breakingLabel?: string;
}

export default function BreakingNews({
  news,
  locale,
}: BreakingNewsProps) {
  let breakingItems = news.filter((item) => item.isBreaking);
  if (breakingItems.length === 0) {
    breakingItems = news.slice(0, 6);
  }

  if (breakingItems.length === 0) return null;

  return (
    <div className="border-b border-gray-200 bg-white dark:border-neutral-800 dark:bg-neutral-950" aria-label="ब्रेकिंग न्यूज़ टिकर">
      <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          {/* Solid Red Pill Badge */}
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#c61d23] px-3 py-1 shadow-sm">
            <AlertCircle className="h-3 w-3 fill-current text-white" aria-hidden="true" />
            <span className="text-[10px] font-black uppercase tracking-wider text-white">
              BREAKING NEWS
            </span>
          </div>

          {/* Scrolling Ticker Text */}
          <div className="relative flex-1 overflow-hidden" role="marquee" aria-live="off">
            <div className="marquee-track flex items-center gap-6 py-0.5">
              {breakingItems.concat(breakingItems).map((item, idx) => {
                const headline =
                  getLocalizedTitle(item as any, locale) || item.title;
                const link = withLocale(locale, `/news/${item.slug || item._id}`);

                return (
                  <Link
                    key={`${item._id}-${idx}`}
                    href={link}
                    className="flex items-center gap-2 text-xs font-semibold text-gray-800 dark:text-neutral-200 hover:text-[#c61d23] dark:hover:text-red-400 whitespace-nowrap transition-colors"
                  >
                    <span aria-hidden="true">/</span>
                    <span className="truncate max-w-lg">{headline}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Small Navigation Arrows on Right */}
        <div className="hidden sm:flex items-center gap-1 text-gray-500 pl-3 border-l border-gray-200 dark:border-neutral-800">
          <button
            type="button"
            aria-label="पिछली ब्रेकिंग न्यूज़"
            className="p-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="अगली ब्रेकिंग न्यूज़"
            className="p-1 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
