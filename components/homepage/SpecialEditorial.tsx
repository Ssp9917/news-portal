"use client";

import Link from "next/link";
import { Layers, ShieldCheck, CheckCircle2, Bookmark, ArrowRight } from "lucide-react";
import { withLocale } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedTitle, getLocalizedExcerpt } from "@/lib/i18n/news-fields";

interface NewsItem {
  _id: string;
  slug?: string;
  title: string;
  titleI18n?: Record<string, string>;
  category: string;
  excerpt: string;
  author: string;
  authorBio?: string;
  date: string;
  image?: string;
  readingTime?: number;
}

interface SpecialEditorialProps {
  news: NewsItem[];
  locale: Locale;
  title?: string;
  subtitle?: string;
}

export default function SpecialEditorial({
  news,
  locale,
  title = "विशेष विश्लेषण व फैक्ट चेक",
  subtitle = "गहन पड़ताल, व्याख्या और तथ्यात्मक विश्लेषण",
}: SpecialEditorialProps) {
  if (!news || news.length === 0) return null;

  const specialPicks = news.slice(0, 3);

  const labels = [
    { tag: "GROUND REPORT", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { tag: "FACT CHECK", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    { tag: "EXPLAINER", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  ];

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
            <Layers className="h-4 w-4" />
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
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Split Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {specialPicks.map((item, idx) => {
          const headline = getLocalizedTitle(item as any, locale) || item.title;
          const excerpt = getLocalizedExcerpt(item as any, locale) || item.excerpt;
          const href = withLocale(locale, `/news/${item.slug || item._id}`);
          const pill = labels[idx % labels.length];

          return (
            <Link
              key={item._id}
              href={href}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-purple-500/40 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xl hover:-translate-y-1"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-800 mb-4">
                  <img
                    src={item.image || "https://placehold.co/600x400"}
                    alt={headline}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className={`absolute top-3 left-3 rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase backdrop-blur-md ${pill.color}`}
                  >
                    {pill.tag}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {item.author}
                  </span>
                  <span>•</span>
                  <span>{item.date}</span>
                </div>

                <h3
                  className="text-base font-bold leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                  style={{
                    fontFamily:
                      locale === "hi"
                        ? "var(--font-noto-serif-devanagari), Georgia, serif"
                        : "Georgia, serif",
                  }}
                >
                  {headline}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                  {excerpt}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                <span>{locale === "hi" ? "पूरा विश्लेषण" : "In-Depth Read"}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
