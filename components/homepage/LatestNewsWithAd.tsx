"use client";

import Link from "next/link";
import { ArrowRight, Clock, User } from "lucide-react";
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
  categoryColor?: string;
  excerpt: string;
  excerptI18n?: Record<string, string>;
  author: string;
  date: string;
  image?: string;
  views?: number;
}

interface LatestNewsWithAdProps {
  news: NewsItem[];
  locale: Locale;
  title?: string;
}

export default function LatestNewsWithAd({
  news,
  locale,
  title = "ताज़ा न्यूज़",
}: LatestNewsWithAdProps) {
  if (!news || news.length === 0) return null;

  const cardStories = news.slice(0, 4);

  return (
    <section className="mb-10">
      {/* Section Header: Vertical Red Bar + Title + "सभी देखें →" */}
      <div className="mb-4 flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-[#c61d23]" />
          <h2 className="text-lg font-black text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>

        <Link
          href={withLocale(locale, "/category/national")}
          className="text-xs font-semibold text-gray-500 hover:text-[#c61d23] dark:text-neutral-400 dark:hover:text-red-400 transition-colors"
        >
          सभी देखें →
        </Link>
      </div>

      {/* Grid: 4 News Cards + 1 Square Ad Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cardStories.map((item) => {
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
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-neutral-800 mb-2.5">
                  <img
                    src={item.image || "https://placehold.co/400x250"}
                    alt={headline}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Category Pill Badge */}
                  <span className="absolute top-2 left-2 rounded bg-[#c61d23] px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                    {item.category}
                  </span>
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
                <span>{item.author || "संवाददाता"}</span>
                <span>{item.date}</span>
              </div>
            </Link>
          );
        })}

        {/* 5th Column: Square Advertisement Card */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 dark:border-neutral-800 bg-[#f8fafc] dark:bg-neutral-900/60 p-3 text-center shadow-sm">
          <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
            ADVERTISEMENT
          </span>
          <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg bg-gradient-to-tr from-blue-900 to-indigo-900 p-4 text-white flex flex-col justify-between shadow">
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              Intel Cloud
            </span>
            <div className="text-left">
              <p className="text-xs font-bold leading-tight">
                Enterprise Cloud Accelerated by AI
              </p>
              <button className="mt-2 rounded bg-cyan-500 px-2.5 py-1 text-[10px] font-bold text-black shadow">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

