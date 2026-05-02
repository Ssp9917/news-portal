"use client";

import { useEffect } from "react";
import NewsCard from "./NewsCard";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setInitialNews, fetchMoreNews, resetNewsState } from "@/lib/features/newsSlice";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/providers/i18n-provider";

interface NewsFeedProps {
  initialNews: Array<Record<string, unknown>>;
  locale: Locale;
}

export default function NewsFeed({ initialNews, locale }: NewsFeedProps) {
  const dispatch = useAppDispatch();
  const { items: news, page, hasMore, loading } = useAppSelector((state) => state.news);
  const { t } = useI18n();

  useEffect(() => {
    dispatch(resetNewsState());
  }, [locale, dispatch]);

  useEffect(() => {
    if (initialNews.length > 0) {
      dispatch(setInitialNews(initialNews as never));
    }
  }, [initialNews, dispatch]);

  const loadMore = () => {
    dispatch(fetchMoreNews(page));
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const displayNews = news.length > 0 ? news : initialNews;

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {displayNews.length > 0 ? (
          displayNews.map((item: Record<string, unknown>, idx: number) => (
            <NewsCard
              key={`${String(item._id)}-${idx}`}
              locale={locale}
              {...(item as never)}
            />
          ))
        ) : (
          <p className="col-span-full py-10 text-center text-gray-500 dark:text-neutral-400">
            {t("feed.noNews")}
          </p>
        )}
      </motion.div>

      {hasMore && displayNews.length > 0 && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded border border-gray-300 px-6 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            {loading ? t("feed.loading") : t("feed.loadMore")}
          </button>
        </div>
      )}
    </>
  );
}
