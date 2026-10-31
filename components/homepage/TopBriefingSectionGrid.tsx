"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { withLocale } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/config";
import {
  getLocalizedTitle,
  getLocalizedExcerpt,
} from "@/lib/i18n/news-fields";

interface NewsItem {
  _id: string;
  slug?: string;
  title: string;
  titleI18n?: Record<string, string>;
  category: string;
  excerpt: string;
  author: string;
  date: string;
  image?: string;
  views?: number;
}

interface TopBriefingSectionGridProps {
  iconEmoji: string;
  title: string;
  categorySlug: string;
  news: NewsItem[];
  locale: Locale;
  showLoadMoreButtons?: boolean;
}

export default function TopBriefingSectionGrid({
  iconEmoji,
  title,
  categorySlug,
  news,
  locale,
  showLoadMoreButtons = false,
}: TopBriefingSectionGridProps) {
  const cardItems = news.slice(0, 4);
  if (cardItems.length === 0) return null;

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{iconEmoji}</span>
          <h2 className="text-lg font-black text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>

        <Link
          href={withLocale(locale, `/category/${categorySlug}`)}
          className="text-xs font-semibold text-gray-500 hover:text-[#c61d23] dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
        >
          और देखें →
        </Link>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardItems.map((item) => {
          const headline =
            getLocalizedTitle(item as any, locale) || item.title;
          const excerpt =
            getLocalizedExcerpt(item as any, locale) || item.excerpt;
          const href = withLocale(locale, `/news/${item.slug || item._id}`);

          return (
            <Link
              key={item._id}
              href={href}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-sm transition-all hover:shadow-md hover:border-gray-300"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-neutral-800 mb-2.5">
                  <img
                    src={item.image || "https://placehold.co/400x250"}
                    alt={headline}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <h3
                  className="text-xs font-bold leading-snug text-gray-900 dark:text-neutral-100 line-clamp-2 group-hover:text-[#c61d23] transition-colors"
                  style={{
                    fontFamily:
                      locale === "hi"
                        ? "var(--font-noto-serif-devanagari), Georgia, serif"
                        : "Georgia, serif",
                  }}
                >
                  {headline}
                </h3>

                <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500 dark:text-neutral-400 line-clamp-2">
                  {excerpt}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-50 dark:border-neutral-800 pt-2">
                <span>{item.author || "स्पोर्ट्स डेस्क"}</span>
                <span>{item.date}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Optional Bottom Action Buttons (matching screenshot below Tech section) */}
      {showLoadMoreButtons && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50">
            <span>अन्य कैटेगरी देखें (Load More Categories)</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-[#c61d23] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#a8161b] transition-colors">
            <span>और खबरें लोड करें →</span>
          </button>
        </div>
      )}
    </section>
  );
}

