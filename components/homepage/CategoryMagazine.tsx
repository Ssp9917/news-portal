"use client";

import Link from "next/link";
import { ArrowRight, Clock, User, Sparkles } from "lucide-react";
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

interface CategoryMagazineProps {
  news: NewsItem[];
  locale: Locale;
  title: string;
  subtitle?: string;
  categorySlug?: string;
  layout?: "magazine" | "grid" | "compact" | "split" | "masonry" | "list" | "carousel";
  accentColor?: string;
}

export default function CategoryMagazine({
  news,
  locale,
  title,
  subtitle,
  categorySlug,
  layout = "magazine",
  accentColor = "from-blue-600 to-indigo-700",
}: CategoryMagazineProps) {
  if (!news || news.length === 0) return null;

  const categoryHref = categorySlug
    ? withLocale(locale, `/category/${categorySlug}`)
    : "#";

  const lead = news[0];
  const rest = news.slice(1, 4);

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`h-5 w-1.5 rounded-full bg-gradient-to-b ${accentColor}`}
          />
          <div>
            <h2
              className="text-2xl font-black tracking-tight text-slate-900 dark:text-white lg:text-3xl"
              style={{
                fontFamily:
                  locale === "hi"
                    ? "var(--font-noto-serif-devanagari), Georgia, serif"
                    : "Georgia, serif",
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {categorySlug && (
          <Link
            href={categoryHref}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <span>{locale === "hi" ? "और देखें" : "View All"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Magazine Layout: 1 Lead (7 cols) + 3 Cards (5 cols) */}
      {layout === "magazine" && lead ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Lead Story */}
          <div className="lg:col-span-7">
            <Link
              href={withLocale(locale, `/news/${lead.slug || lead._id}`)}
              className="group block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4 shadow-sm backdrop-blur-md transition-all hover:shadow-xl hover:border-blue-500/30"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-800">
                <img
                  src={lead.image || "https://placehold.co/800x500"}
                  alt={lead.title}
                  width={800}
                  height={500}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {lead.category}
                  </span>
                  <span>•</span>
                  <span>{lead.date}</span>
                </div>

                <h3
                  className="text-xl font-bold leading-snug text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  style={{
                    fontFamily:
                      locale === "hi"
                        ? "var(--font-noto-serif-devanagari), Georgia, serif"
                        : "Georgia, serif",
                  }}
                >
                  {getLocalizedTitle(lead as any, locale) || lead.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                  {getLocalizedExcerpt(lead as any, locale) || lead.excerpt}
                </p>
              </div>
            </Link>
          </div>

          {/* Side 3 Stories */}
          <div className="space-y-4 lg:col-span-5 flex flex-col justify-between">
            {rest.map((item) => {
              const headline = getLocalizedTitle(item as any, locale) || item.title;
              const href = withLocale(locale, `/news/${item.slug || item._id}`);

              return (
                <Link
                  key={item._id}
                  href={href}
                  className="group flex flex-1 items-start gap-3.5 overflow-hidden rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-3 shadow-sm backdrop-blur-md transition-all hover:border-blue-500/30 hover:bg-white dark:hover:bg-slate-800/80"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                    <img
                      src={item.image || "https://placehold.co/240x160"}
                      alt={item.title}
                      width={240}
                      height={160}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-400 font-mono block mb-1">
                      {item.date}
                    </span>
                    <h4
                      className="text-xs font-bold leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                      style={{
                        fontFamily:
                          locale === "hi"
                            ? "var(--font-noto-serif-devanagari), Georgia, serif"
                            : "Georgia, serif",
                      }}
                    >
                      {headline}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        /* Grid Layout (4 columns) */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {news.slice(0, 4).map((item) => {
            const headline = getLocalizedTitle(item as any, locale) || item.title;
            const href = withLocale(locale, `/news/${item.slug || item._id}`);

            return (
              <Link
                key={item._id}
                href={href}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-3.5 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-800 mb-3">
                    <img
                      src={item.image || "https://placehold.co/400x250"}
                      alt={item.title}
                      width={400}
                      height={250}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1.5">
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {item.category}
                    </span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                  <h4
                    className="text-xs font-bold leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    style={{
                      fontFamily:
                        locale === "hi"
                          ? "var(--font-noto-serif-devanagari), Georgia, serif"
                          : "Georgia, serif",
                    }}
                  >
                    {headline}
                  </h4>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
