"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
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
  readingTime?: number;
  isFeatured?: boolean;
}

interface HeroSpotlightProps {
  news: NewsItem[];
  locale: Locale;
  title?: string;
  subtitle?: string;
}

export default function HeroSpotlight({ news, locale }: HeroSpotlightProps) {
  if (!news || news.length === 0) return null;

  // 1. Featured stories pool for Left Column Auto Slider (up to 5 top stories)
  const featuredStories = (() => {
    const explicit = news.filter((n) => n.isFeatured);
    const others = news.filter((n) => !n.isFeatured);
    const combined = [...explicit, ...others];
    return combined.slice(0, 5);
  })();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide interval: 4.5 seconds per slide
  useEffect(() => {
    if (isPaused || featuredStories.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredStories.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, featuredStories.length]);

  const activeFeatured = featuredStories[currentIndex] || news[0];

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? featuredStories.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % featuredStories.length);
  };

  // 2. Middle Column: 4 stacked cards (exclude currently active featured story)
  const middleStories = news
    .filter((n) => n._id !== activeFeatured._id)
    .slice(0, 4);

  // 3. Right Column: 5 numbered Trending Stories
  const trendingStories = [...news]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);

  const featuredTitle =
    getLocalizedTitle(activeFeatured as any, locale) || activeFeatured.title;
  const featuredHref = withLocale(
    locale,
    `/news/${activeFeatured.slug || activeFeatured._id}`
  );

  return (
    <section className="mb-10" aria-label="मुख्य और ट्रेंडिंग समाचार">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ── Left Column (approx 50% / 6 cols): Auto-Sliding Featured Carousel ── */}
        <div
          className="lg:col-span-6 group relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <Link
            href={featuredHref}
            className="relative block overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800 bg-neutral-900 shadow-md focus:outline-none focus:ring-2 focus:ring-[#c61d23]"
            aria-label={`विशेष समाचार: ${featuredTitle}`}
          >
            <div className="relative aspect-[16/11] w-full overflow-hidden bg-neutral-950">
              {/* Main Image with smooth keyframe transition */}
              <img
                key={activeFeatured._id}
                src={
                  activeFeatured.image ||
                  "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1000&auto=format&fit=crop&q=80"
                }
                alt={featuredTitle}
                width={800}
                height={550}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 animate-in fade-in zoom-in-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />

              {/* Red Pill Category Badge & Live Slide Counter */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                <span className="rounded-full bg-[#c61d23] px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                  {activeFeatured.category || "विशेष खबर"}
                </span>
                <span className="rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono font-bold text-white/90 border border-white/20">
                  {currentIndex + 1} / {featuredStories.length}
                </span>
              </div>

              {/* Progress Countdown Bar */}
              <div className="absolute top-0 inset-x-0 h-1 bg-white/10 z-10">
                <div
                  key={`prog-${currentIndex}-${isPaused}`}
                  className={`h-full bg-gradient-to-r from-red-600 to-amber-400 ${
                    !isPaused ? "animate-[progress_4.5s_linear_forwards]" : ""
                  }`}
                  style={{ width: isPaused ? "100%" : undefined }}
                />
              </div>

              {/* Left Navigation Arrow */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-[#c61d23] hover:scale-110 transition-all cursor-pointer shadow-lg border border-white/20"
                aria-label="पिछली खबर (Previous Slide)"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Right Navigation Arrow */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-[#c61d23] hover:scale-110 transition-all cursor-pointer shadow-lg border border-white/20"
                aria-label="अगली खबर (Next Slide)"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Bottom Content Overlay */}
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 z-10">
                <h2
                  className="text-xl font-bold leading-snug text-white sm:text-2xl group-hover:text-red-200 transition-colors line-clamp-2"
                  style={{
                    fontFamily:
                      locale === "hi"
                        ? "var(--font-noto-serif-devanagari), Georgia, serif"
                        : "Georgia, serif",
                  }}
                >
                  {featuredTitle}
                </h2>

                <div className="mt-2.5 flex items-center gap-3 text-[11px] text-gray-200 font-medium">
                  <span>📅 {activeFeatured.date}</span>
                  <span>•</span>
                  <span>{activeFeatured.author || "संवाददाता"}</span>
                  {activeFeatured.readingTime && (
                    <>
                      <span>•</span>
                      <span>~{activeFeatured.readingTime} min read</span>
                    </>
                  )}
                </div>

                {/* Clickable Pagination Dots */}
                <div
                  className="mt-4 flex items-center justify-center gap-1.5"
                  aria-label="Slider Controls"
                >
                  {featuredStories.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        idx === currentIndex
                          ? "w-7 bg-[#c61d23] shadow-md ring-1 ring-white/50"
                          : "w-2 bg-white/60 hover:bg-white"
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* ── Middle Column (approx 25% / 3 cols): 4 Stacked Cards ── */}
        <div className="space-y-3 lg:col-span-3 flex flex-col justify-between">
          {middleStories.map((item) => {
            const title =
              getLocalizedTitle(item as any, locale) || item.title;
            const href = withLocale(locale, `/news/${item.slug || item._id}`);

            return (
              <Link
                key={item._id}
                href={href}
                className="group flex items-start gap-3 rounded-lg border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2.5 shadow-sm transition-all hover:shadow-md hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#c61d23]"
                aria-label={title}
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md bg-gray-200 dark:bg-neutral-800">
                  <img
                    src={item.image || "https://placehold.co/160x120"}
                    alt={title}
                    width={160}
                    height={120}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className="text-xs font-bold leading-snug text-gray-900 dark:text-neutral-100 line-clamp-2 group-hover:text-[#c61d23] transition-colors"
                    style={{
                      fontFamily:
                        locale === "hi"
                          ? "var(--font-noto-serif-devanagari), Georgia, serif"
                          : "Georgia, serif",
                    }}
                  >
                    {title}
                  </h3>
                  <div className="mt-1 text-[10px] text-gray-600 dark:text-neutral-400 font-medium">
                    {item.date}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Right Column (approx 25% / 3 cols): Trending News Box ── */}
        <div className="lg:col-span-3">
          <div className="h-full rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm flex flex-col justify-between">
            {/* Box Header */}
            <div className="mb-3 flex items-center gap-1.5 border-b border-gray-100 dark:border-neutral-800 pb-2.5">
              <Flame className="h-4 w-4 fill-current text-[#c61d23]" aria-hidden="true" />
              <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                ट्रेंडिंग न्यूज़
              </h2>
            </div>

            {/* 5 Numbered Items */}
            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {trendingStories.map((item, idx) => {
                const title =
                  getLocalizedTitle(item as any, locale) || item.title;
                const href = withLocale(
                  locale,
                  `/news/${item.slug || item._id}`
                );

                return (
                  <Link
                    key={item._id}
                    href={href}
                    className="group flex items-start gap-2.5 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#c61d23] rounded"
                    aria-label={`ट्रेंडिंग #${idx + 1}: ${title}`}
                  >
                    {/* Red Number Circle */}
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#c61d23] text-[10px] font-bold text-white shadow-sm mt-0.5">
                      {idx + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-xs font-bold leading-snug text-gray-900 dark:text-neutral-100 line-clamp-2 group-hover:text-[#c61d23] transition-colors"
                        style={{
                          fontFamily:
                            locale === "hi"
                              ? "var(--font-noto-serif-devanagari), Georgia, serif"
                              : "Georgia, serif",
                        }}
                      >
                        {title}
                      </h3>
                      <span className="mt-0.5 block text-[10px] text-gray-600 dark:text-neutral-400 font-medium">
                        {item.date}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
