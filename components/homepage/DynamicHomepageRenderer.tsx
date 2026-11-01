"use client";

import HeroSpotlight from "./HeroSpotlight";
import TrendingRank from "./TrendingRank";
import CategoryMagazine from "./CategoryMagazine";
import VideoHub from "./VideoHub";
import SpecialEditorial from "./SpecialEditorial";
import NewsletterBox from "./NewsletterBox";
import AdPlacement from "./AdPlacement";
import PollWidget from "@/components/interactive/PollWidget";
import NewsFeed from "@/components/NewsFeed";
import type { Locale } from "@/lib/i18n/config";

interface HomepageSection {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  categorySlug?: string;
  layout: "magazine" | "grid" | "compact" | "split" | "masonry" | "list" | "carousel";
  articleCount: number;
  background: "transparent" | "glass" | "subtle-gradient" | "solid-dark";
  accentColor?: string;
  isEnabled: boolean;
  order: number;
}

interface DynamicHomepageRendererProps {
  sections: HomepageSection[];
  news: any[];
  locale: Locale;
}

export default function DynamicHomepageRenderer({
  sections,
  news,
  locale,
}: DynamicHomepageRendererProps) {
  // Sort sections by order
  const activeSections = [...sections]
    .filter((s) => s.isEnabled !== false)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {activeSections.map((sec) => {
        // Filter news for this section if categorySlug is set
        let sectionNews = news;
        if (sec.categorySlug) {
          sectionNews = news.filter((item) => {
            return (
              item.category?.toLowerCase() === sec.categorySlug?.toLowerCase() ||
              item.slug?.includes(sec.categorySlug || "") ||
              (sec.categorySlug === "politics" && item.category === "राजनीति") ||
              (sec.categorySlug === "business" && item.category === "व्यापार") ||
              (sec.categorySlug === "sports" && item.category === "खेल") ||
              (sec.categorySlug === "technology" && item.category === "तकनीक") ||
              (sec.categorySlug === "health" && item.category === "स्वास्थ्य") ||
              (sec.categorySlug === "education" && item.category === "शिक्षा")
            );
          });
          // If no items in category yet, fallback gracefully to recent news
          if (sectionNews.length === 0) {
            sectionNews = news;
          }
        }

        switch (sec.type) {
          case "hero-spotlight":
            return (
              <HeroSpotlight
                key={sec.id}
                news={news}
                locale={locale}
                title={sec.title || "प्रमुख समाचार"}
                subtitle={sec.subtitle}
              />
            );

          case "trending-rank":
            return (
              <TrendingRank
                key={sec.id}
                news={news}
                locale={locale}
                title={sec.title || "ट्रेंडिंग न्यूज़"}
                subtitle={sec.subtitle}
              />
            );

          case "category-magazine":
            return (
              <CategoryMagazine
                key={sec.id}
                news={sectionNews}
                locale={locale}
                title={sec.title}
                subtitle={sec.subtitle}
                categorySlug={sec.categorySlug}
                layout={sec.layout}
                accentColor={sec.accentColor}
              />
            );

          case "video-hub":
            return (
              <VideoHub
                key={sec.id}
                news={news}
                locale={locale}
                title={sec.title || "वीडियो न्यूज़"}
                subtitle={sec.subtitle}
              />
            );

          case "special-editorial":
            return (
              <SpecialEditorial
                key={sec.id}
                news={news}
                locale={locale}
                title={sec.title}
                subtitle={sec.subtitle}
              />
            );

          case "latest-feed":
            return (
              <div key={sec.id} className="mb-12">
                <div className="mb-6 border-b border-slate-200/80 dark:border-white/10 pb-3">
                  <h2
                    className="text-2xl font-black tracking-tight text-slate-900 dark:text-white lg:text-3xl"
                    style={{
                      fontFamily:
                        locale === "hi"
                          ? "var(--font-noto-serif-devanagari), Georgia, serif"
                          : "Georgia, serif",
                    }}
                  >
                    {sec.title || "ताज़ा समाचार"}
                  </h2>
                  {sec.subtitle && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {sec.subtitle}
                    </p>
                  )}
                </div>
                <NewsFeed initialNews={news} locale={locale} />
              </div>
            );

          case "newsletter":
            return (
              <NewsletterBox
                key={sec.id}
                locale={locale}
                title={sec.title}
                subtitle={sec.subtitle}
              />
            );

          case "poll-widget":
          case "poll":
            return (
              <div key={sec.id} className="my-8">
                <PollWidget />
              </div>
            );

          case "ad-banner":
            return <AdPlacement key={sec.id} slot="hero_after" />;

          default:
            return null;
        }
      })}
    </div>
  );
}
