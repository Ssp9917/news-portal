"use client";

import { useEffect } from "react";
import NewsCard from "./NewsCard";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setInitialNews, fetchMoreNews, resetNewsState } from "@/lib/features/newsSlice";
import type { Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/providers/i18n-provider";
import NewsFeedSkeleton from "@/components/skeletons/NewsFeedSkeleton";

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

  const displayNews = news.length > 0 ? news : initialNews;

  // Show shimmer skeleton on initial load (no items yet and loading)
  if (loading && displayNews.length === 0) {
    return <NewsFeedSkeleton count={8} />;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        {displayNews.length > 0 ? (
          displayNews.map((newsItem: Record<string, unknown>, idx: number) => (
            <motion.div key={`${String(newsItem._id)}-${idx}`} variants={item}>
              <NewsCard
                locale={locale}
                {...(newsItem as never)}
              />
            </motion.div>
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
            className="group relative overflow-hidden rounded-lg border border-gray-300 px-8 py-2.5 text-sm font-semibold transition-all hover:border-[#D32F2F] hover:text-[#D32F2F] disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-red-400 dark:hover:text-red-400"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t("feed.loading")}
              </span>
            ) : (
              t("feed.loadMore")
            )}
          </button>
        </div>
      )}
    </>
  );
}
