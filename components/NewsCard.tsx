"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/components/providers/i18n-provider";
import { withLocale } from "@/lib/i18n/paths";
import { getLocalizedExcerpt, getLocalizedTitle } from "@/lib/i18n/news-fields";
import type { Locale } from "@/lib/i18n/config";
import { Clock, User } from "lucide-react";

interface NewsCardProps {
  _id: string;
  slug?: string;
  category: string;
  categoryColor?: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  image?: string;
  locale?: string;
  titleI18n?: Record<string, string | undefined>;
  excerptI18n?: Record<string, string | undefined>;
}

export default function NewsCard({
  _id,
  slug,
  category,
  categoryColor = "bg-blue-600",
  title,
  excerpt,
  author,
  date,
  image,
  locale,
  titleI18n,
  excerptI18n,
}: NewsCardProps) {
  const { locale: ctxLocale } = useI18n();
  const activeLocale = locale ?? ctxLocale;
  const displayTitle = getLocalizedTitle(
    { title, titleI18n },
    activeLocale as Locale
  );
  const displayExcerpt = getLocalizedExcerpt(
    { excerpt, excerptI18n },
    activeLocale as Locale
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="h-full"
    >
      <Link
        href={withLocale(activeLocale, `/news/${slug || _id}`)}
        className="block h-full group"
      >
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-blue-500/40 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xl hover:-translate-y-1">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
            <img
              src={image || "https://placehold.co/600x400/png"}
              alt={displayTitle}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-grow flex-col p-4 sm:p-5">
            <span
              className={`mb-2.5 inline-block self-start rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${categoryColor}`}
            >
              {category}
            </span>
            <h3
              className="mb-2 line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
              style={{
                fontFamily:
                  activeLocale === "hi"
                    ? "var(--font-noto-serif-devanagari), Georgia, serif"
                    : "Georgia, serif",
              }}
            >
              {displayTitle}
            </h3>
            <p className="mb-4 line-clamp-2 flex-grow text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {displayExcerpt}
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span className="font-sans font-medium text-slate-600 dark:text-slate-300 truncate max-w-[120px]">
                {author}
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="h-3 w-3" />
                {date}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
