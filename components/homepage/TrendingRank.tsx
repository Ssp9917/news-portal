"use client";

import Link from "next/link";
import { Flame, Eye, TrendingUp, Sparkles } from "lucide-react";
import { withLocale } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedTitle } from "@/lib/i18n/news-fields";

interface NewsItem {
  _id: string;
  slug?: string;
  title: string;
  titleI18n?: Record<string, string>;
  category: string;
  categoryColor?: string;
  date: string;
  views?: number;
  image?: string;
  isTrending?: boolean;
}

interface TrendingRankProps {
  news: NewsItem[];
  locale: Locale;
  title?: string;
  subtitle?: string;
}

export default function TrendingRank({
  news,
  locale,
  title = "ट्रेंडिंग न्यूज़",
  subtitle = "पाठकों द्वारा सबसे ज्यादा पढ़े और साझा किए जा रहे समाचार",
}: TrendingRankProps) {
  if (!news || news.length === 0) return null;

  // Sort by views or isTrending
  const sorted = [...news]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  return (
    <section className="mb-12 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-b from-slate-100/60 to-white/60 dark:from-slate-900/40 dark:to-slate-950/40 p-6 lg:p-8 backdrop-blur-xl shadow-xl shadow-black/5">
      {/* Section Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 text-white shadow-lg shadow-amber-500/25">
            <Flame className="h-5 w-5" />
          </div>
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
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="mt-2 sm:mt-0 flex items-center gap-1.5 text-xs font-bold text-amber-500">
          <TrendingUp className="h-4 w-4" />
          <span>Real-Time Virality Index</span>
        </div>
      </div>

      {/* 5-Column Ranked Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {sorted.map((item, idx) => {
          const headline = getLocalizedTitle(item as any, locale) || item.title;
          const href = withLocale(locale, `/news/${item.slug || item._id}`);

          return (
            <Link
              key={item._id}
              href={href}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-amber-500/40 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xl hover:-translate-y-1"
            >
              <div>
                {/* Ranking Number Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500/20 to-red-500/20 text-base font-black font-mono text-amber-600 dark:text-amber-400 border border-amber-500/30">
                    0{idx + 1}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-400 group-hover:text-amber-500 transition-colors">
                    <Eye className="h-3 w-3" />
                    {(item.views || 0).toLocaleString()}
                  </span>
                </div>

                {/* Category & Headline */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                  {item.category}
                </span>

                <h4
                  className="text-xs font-bold leading-snug text-slate-900 dark:text-white line-clamp-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
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

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                <span>{item.date}</span>
                <span className="font-bold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
