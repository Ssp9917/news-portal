"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/components/providers/i18n-provider";
import { withLocale } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedExcerpt, getLocalizedTitle } from "@/lib/i18n/news-fields";

interface HeroSectionProps {
  news: Array<Record<string, unknown>>;
}

export default function HeroSection({ news = [] }: HeroSectionProps) {
  const { locale, t } = useI18n();
  const mainNews = news[0];
  const sideNews = news.slice(1, 6);

  if (!mainNews) {
    return (
      <section className="mb-8 rounded-xl bg-gray-50 py-10 text-center text-gray-500 transition-colors md:mb-12 dark:bg-neutral-900/70 dark:text-neutral-400">
        {t("hero.loading")}
      </section>
    );
  }

  const leadHref = withLocale(
    locale,
    `/news/${String(mainNews.slug ?? mainNews._id)}`
  );
  const leadTitle = getLocalizedTitle(mainNews as never, locale as Locale);
  const leadExcerpt = getLocalizedExcerpt(mainNews as never, locale as Locale);

  return (
    <section className="mb-8 grid grid-cols-1 gap-6 md:mb-12 md:gap-8 lg:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-2"
      >
        <Link
          href={leadHref}
          className="group relative block h-[300px] overflow-hidden rounded-xl shadow-sm sm:h-[400px] md:h-[500px]"
        >
          <div className="absolute inset-0 bg-gray-300 dark:bg-neutral-800">
            <Image
              src={String(mainNews.image || "https://placehold.co/800x600/png")}
              alt={leadTitle}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-8">
            <span
              className={`mb-2 inline-block rounded px-2 py-1 text-[10px] font-bold text-white sm:mb-3 sm:px-3 sm:text-xs ${String(mainNews.categoryColor || "bg-[#7C3AED]")}`}
            >
              {String(mainNews.category)}
            </span>
            <h1 className="mb-2 line-clamp-2 text-xl font-bold leading-tight text-white sm:mb-3 sm:text-3xl md:line-clamp-3 md:text-4xl">
              {leadTitle}
            </h1>
            <p className="mb-3 line-clamp-2 hidden text-xs text-gray-200 sm:mb-4 sm:block sm:text-sm md:text-base">
              {leadExcerpt}
            </p>
            <div className="flex items-center gap-3 text-[10px] text-gray-300 sm:gap-4 sm:text-xs">
              <span className="font-medium">{String(mainNews.author)}</span>
              <span aria-hidden="true">•</span>
              <span>{String(mainNews.date)}</span>
            </div>
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="h-full max-h-[400px] overflow-y-auto rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:max-h-full dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="flex flex-col gap-4 sm:gap-6">
          {sideNews.length > 0 ? (
            sideNews.map((item, idx) => (
              <Link
                key={idx}
                href={withLocale(locale, `/news/${String(item.slug ?? item._id)}`)}
                className="group flex cursor-pointer gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0 dark:border-neutral-800 sm:gap-4 sm:pb-4"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 transition-colors group-hover:bg-[#D32F2F] group-hover:text-white sm:h-8 sm:w-8 sm:text-sm dark:bg-neutral-800 dark:text-neutral-300">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#D32F2F] dark:text-neutral-100">
                    {getLocalizedTitle(item as never, locale as Locale)}
                  </h3>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-neutral-400">{t("hero.noSide")}</p>
          )}
        </div>
      </motion.div>
    </section>
  );
}
