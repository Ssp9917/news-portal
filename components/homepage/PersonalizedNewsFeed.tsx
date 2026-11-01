"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, Clock, Flame, MapPin, Heart, ArrowRight } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { withLocale } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/config";

interface NewsItem {
  _id: string;
  slug?: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  date: string;
  image?: string;
  views?: number;
  location?: {
    city?: string;
    state?: string;
  };
}

interface PersonalizedNewsFeedProps {
  allNews: NewsItem[];
  locale: Locale;
}

export default function PersonalizedNewsFeed({ allNews, locale }: PersonalizedNewsFeedProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"foryou" | "latest" | "trending" | "local" | "following">("foryou");

  const followedCategories = user?.preferences?.categories || ["national", "politics", "sports"];
  const userCity = user?.preferences?.city || "";

  // Dynamic feed calculation
  const displayedArticles = useMemo(() => {
    if (activeTab === "latest") {
      return [...allNews].slice(0, 8);
    }
    if (activeTab === "trending") {
      return [...allNews].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 8);
    }
    if (activeTab === "local") {
      const localMatches = allNews.filter(
        (n) =>
          (userCity && n.location?.city?.toLowerCase() === userCity.toLowerCase()) ||
          n.location?.city ||
          n.category === "राष्ट्रीय"
      );
      return localMatches.length > 0 ? localMatches.slice(0, 8) : allNews.slice(0, 8);
    }
    if (activeTab === "following") {
      const followingMatches = allNews.filter((n) =>
        followedCategories.some((cat) => n.category.toLowerCase().includes(cat.toLowerCase()))
      );
      return followingMatches.length > 0 ? followingMatches.slice(0, 8) : allNews.slice(0, 8);
    }

    // Default "For You": prioritizes followed categories, local city, and high views
    const forYouList = [...allNews].sort((a, b) => {
      let scoreA = (a.views || 0);
      let scoreB = (b.views || 0);

      if (userCity && a.location?.city?.toLowerCase() === userCity.toLowerCase()) scoreA += 500;
      if (userCity && b.location?.city?.toLowerCase() === userCity.toLowerCase()) scoreB += 500;

      if (followedCategories.some((cat) => a.category.toLowerCase().includes(cat.toLowerCase()))) scoreA += 200;
      if (followedCategories.some((cat) => b.category.toLowerCase().includes(cat.toLowerCase()))) scoreB += 200;

      return scoreB - scoreA;
    });

    return forYouList.slice(0, 8);
  }, [activeTab, allNews, followedCategories, userCity]);

  const tabs = [
    { id: "foryou", label: "आपके लिए (For You)", icon: Sparkles },
    { id: "latest", label: "ताज़ा (Latest)", icon: Clock },
    { id: "trending", label: "ट्रेंडिंग (Trending)", icon: Flame },
    { id: "local", label: "मेरा शहर (Local)", icon: MapPin },
    { id: "following", label: "फॉलोइंग (Following)", icon: Heart },
  ] as const;

  return (
    <section aria-label="व्यक्तिगत समाचार फ़ीड" className="mb-10">
      {/* Tab Switcher Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 dark:border-neutral-800 pb-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#c61d23] text-white shadow-md shadow-red-900/20"
                    : "border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 hover:border-gray-400"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-amber-300" : ""}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <Link
          href={withLocale(locale, activeTab === "local" ? "/local-news" : "/category/national")}
          className="text-xs font-semibold text-gray-600 dark:text-neutral-400 hover:text-[#c61d23] flex items-center gap-1 transition-colors"
        >
          <span>सभी देखें</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Grid of 8 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedArticles.map((item, idx) => {
          const href = withLocale(locale, `/news/${item.slug || item._id}`);
          const altTag = `${item.title} - ${item.category} समाचार | भारत पल्स`;

          return (
            <Link
              key={item._id}
              href={href}
              className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800 mb-2.5">
                  <img
                    src={item.image || "https://placehold.co/400x250"}
                    alt={altTag}
                    width={400}
                    height={250}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 rounded bg-[#c61d23] px-2 py-0.5 text-[9px] font-bold text-white shadow">
                    {item.category}
                  </span>
                  {activeTab === "trending" && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-[10px] font-black text-amber-300 shadow">
                      #{idx + 1}
                    </span>
                  )}
                  {item.location?.city && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
                      <MapPin className="h-2.5 w-2.5" />
                      <span>{item.location.city}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold leading-snug text-gray-900 dark:text-neutral-100 line-clamp-2 group-hover:text-[#c61d23] transition-colors">
                  {item.title}
                </h3>

                <p className="mt-1.5 text-[11px] leading-relaxed text-gray-600 dark:text-neutral-300 line-clamp-2">
                  {item.excerpt}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-2 text-[10px] text-gray-500 font-medium">
                <span>{item.author || "संवाददाता"}</span>
                <span>{item.date}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

