import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import PremiumHeader from "@/components/PremiumHeader";
import BreakingNews from "@/components/BreakingNews";
import HeroSpotlight from "@/components/homepage/HeroSpotlight";
import PersonalizedNewsFeed from "@/components/homepage/PersonalizedNewsFeed";
import LatestNewsWithAd from "@/components/homepage/LatestNewsWithAd";
import SectionNewsGrid from "@/components/homepage/SectionNewsGrid";
import PollWidget from "@/components/interactive/PollWidget";
import VideoHub from "@/components/homepage/VideoHub";
import DynamicHomepageRenderer from "@/components/homepage/DynamicHomepageRenderer";
import Footer from "@/components/Footer";
import TopAnnouncementStrip from "@/components/promotions/TopAnnouncementStrip";
import StickyBottomMobileBanner from "@/components/promotions/StickyBottomMobileBanner";
import NotificationPrompt from "@/components/notifications/NotificationPrompt";
import LocationPrompt from "@/components/location/LocationPrompt";
import connectDB from "@/lib/db";
import News from "@/models/News";
import HomepageConfig from "@/models/HomepageConfig";
import { ensureDefaultData } from "@/lib/init-defaults";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/site-url";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const site = getSiteUrl();

  return {
    title: "Bharat Pulse (भारत पल्स) — देश और दुनिया की ताज़ा ख़बरें | National & World News",
    description: "राजनीति, खेल, तकनीक, दुनिया, व्यापार, मनोरंजन, स्वास्थ्य और मौसम से ताज़ा और प्रामाणिक ख़बरें।",
    alternates: {
      canonical: `${site}/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `${site}/${l}`])) as Record<
        string,
        string
      >,
    },
  };
}

async function getHomepageData() {
  try {
    await connectDB();
    await ensureDefaultData();

    const [newsDocs, configDoc] = await Promise.all([
      News.find({ published: { $ne: false } })
        .sort({ createdAt: -1 })
        .limit(40)
        .lean(),
      HomepageConfig.findOne().sort({ updatedAt: -1 }).lean(),
    ]);

    return {
      allNews: JSON.parse(JSON.stringify(newsDocs)),
      homepageConfig: configDoc ? JSON.parse(JSON.stringify(configDoc)) : null,
    };
  } catch (error: unknown) {
    console.error("Failed to fetch homepage data:", error);
    return { allNews: [], homepageConfig: null };
  }
}

export default async function Home({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const { allNews, homepageConfig } = await getHomepageData();

  const hasCustomSections =
    homepageConfig &&
    Array.isArray(homepageConfig.sections) &&
    homepageConfig.sections.length > 0 &&
    homepageConfig.isPublished !== false;

  // Curate news for each specific editorial beat matching the reference layout
  const sportsNews = allNews.filter(
    (n: any) =>
      n.category === "खेल" ||
      n.slug?.includes("australia") ||
      n.slug?.includes("cricket")
  );
  const businessNews = allNews.filter(
    (n: any) =>
      n.category === "व्यापार" ||
      n.slug?.includes("sensex") ||
      n.slug?.includes("funding")
  );
  const techNews = allNews.filter(
    (n: any) =>
      n.category === "तकनीक" ||
      n.slug?.includes("ai") ||
      n.slug?.includes("tech")
  );

  // If a category has fewer than 4 articles, supplement with other news
  const fillToFour = (primaryList: any[]) => {
    const list = [...primaryList];
    for (const item of allNews) {
      if (list.length >= 4) break;
      if (!list.find((i) => i._id === item._id)) {
        list.push(item);
      }
    }
    return list;
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#0c0c0c] text-gray-900 dark:text-neutral-100 transition-colors">
      {/* 0. Top Announcement Strip (Admin Broadcast / Marketing / Breaking alert) */}
      <TopAnnouncementStrip />

      {/* 1. Top Utility Bar: Date, Time, Location Updated | Login/SignUp + Socials */}
      <TopBar />

      {/* 2. Main Red Header: Bharat Pulse logo, Home, Categories ▾, Dynamic categories & links, Search, ! SUBSCRIBE */}
      <PremiumHeader />

      {/* 3. Breaking News Ticker: ! BREAKING NEWS red pill, scrolling text, < > arrows */}
      <BreakingNews news={allNews} locale={locale} />

      {/* Main Container with landmark id for skip-to-content accessibility */}
      <main id="main-content" tabIndex={-1} className="container mx-auto max-w-7xl px-4 py-6 outline-none">
        {hasCustomSections ? (
          /* Dynamic Admin Homepage Builder Sections */
          <div className="space-y-8">
            <div className="my-2">
              <PersonalizedNewsFeed allNews={allNews} locale={locale} />
            </div>

            <DynamicHomepageRenderer
              sections={homepageConfig.sections}
              news={allNews}
              locale={locale}
            />

            <div className="my-10">
              <PollWidget />
            </div>
          </div>
        ) : (
          /* Curated Default Layout */
          <>
            {/* Section 1: Hero Section (3 columns: 50% Featured Taxi/Rain Card | 25% 4 Stacked Cards | 25% 1-5 Trending Box) */}
            <HeroSpotlight news={allNews} locale={locale} />

            {/* Section 1.5: Personalized News Feed (For You / Latest / Trending / Local / Following) */}
            <div className="my-8">
              <PersonalizedNewsFeed allNews={allNews} locale={locale} />
            </div>

            {/* Section 2: "ताज़ा न्यूज़" (4 News Cards with red badges + 1 Square Ad card on right) */}
            <LatestNewsWithAd news={allNews} locale={locale} title="ताज़ा न्यूज़" />

            {/* Section 3: "कैटेगरी अनुसार खबरें (News By Categories)" */}
            <LatestNewsWithAd
              news={allNews.slice(2)}
              locale={locale}
              title="कैटेगरी अनुसार खबरें (News By Categories)"
            />

            {/* Section 4: "🏏 खेल" (Sports News - 4 Cards Grid) */}
            <SectionNewsGrid
              iconEmoji="🏏"
              title="खेल"
              categorySlug="sports"
              news={fillToFour(sportsNews)}
              locale={locale}
            />

            {/* Section 5: "📈 बिजनेस" (Business News - 4 Cards Grid with stock market charts) */}
            <SectionNewsGrid
              iconEmoji="📈"
              title="बिजनेस"
              categorySlug="business"
              news={fillToFour(businessNews)}
              locale={locale}
            />

            {/* Section 6: "💻 टेक्नोलॉजी" (Technology News - 4 Cards Grid + 2 Bottom Load More buttons) */}
            <SectionNewsGrid
              iconEmoji="💻"
              title="टेक्नोलॉजी"
              categorySlug="technology"
              news={fillToFour(techNews)}
              locale={locale}
              showLoadMoreButtons={true}
            />

            {/* Section 6.5: Interactive Public Opinion Poll (जनता की राय / Reader Poll) */}
            <div className="my-10">
              <PollWidget />
            </div>

            {/* Section 7: "वीडियो अपडेट्स" (3 Video Cards with centered red Play button + 1 Newsletter Card) */}
            <VideoHub news={allNews} locale={locale} />
          </>
        )}
      </main>

      {/* Dynamic Non-Intrusive Prompts */}
      <NotificationPrompt />
      <LocationPrompt />
      <StickyBottomMobileBanner />

      {/* 4. Dark Footer (Bharat Pulse logo, contact email, Android App button, Category counts, 5 Recent news with thumbnails) */}
      <Footer />
    </div>
  );
}
