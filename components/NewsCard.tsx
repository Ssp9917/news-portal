"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/components/providers/i18n-provider";
import { withLocale } from "@/lib/i18n/paths";
import { getLocalizedExcerpt, getLocalizedTitle } from "@/lib/i18n/news-fields";
import type { Locale } from "@/lib/i18n/config";

interface NewsCardProps {
  _id: string;
  slug?: string;
  category: string;
  categoryColor: string;
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
  categoryColor,
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Link
        href={withLocale(activeLocale, `/news/${slug || _id}`)}
        className="block h-full"
      >
        <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
          <div className="relative h-48 w-full overflow-hidden bg-gray-200 dark:bg-neutral-900">
            <Image
              src={image || "https://placehold.co/600x400/png"}
              alt={displayTitle}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-grow flex-col p-5">
            <span
              className={`mb-3 inline-block self-start rounded px-2 py-1 text-[10px] font-bold uppercase text-white ${categoryColor}`}
            >
              {category}
            </span>
            <h3 className="mb-3 line-clamp-3 text-lg font-bold leading-tight text-gray-900 transition-colors group-hover:text-[#D32F2F] dark:text-neutral-100">
              {displayTitle}
            </h3>
            <p className="mb-4 line-clamp-3 flex-grow text-sm text-gray-500 dark:text-neutral-400">
              {displayExcerpt}
            </p>
            <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4 text-xs text-gray-400 dark:border-neutral-800 dark:text-neutral-500">
              <span className="font-medium text-gray-600 dark:text-neutral-300">{author}</span>
              <span className="flex items-center gap-1">
                <span aria-hidden="true">🕒</span>
                {date}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
