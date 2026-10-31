import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import PremiumHeader from "@/components/PremiumHeader";
import BreakingNews from "@/components/BreakingNews";
import HeroSpotlight from "@/components/homepage/HeroSpotlight";
import LatestNewsWithAd from "@/components/homepage/LatestNewsWithAd";
import TopBriefingSectionGrid from "@/components/homepage/TopBriefingSectionGrid";
import VideoHub from "@/components/homepage/VideoHub";
import Footer from "@/components/Footer";
import connectDB from "@/lib/db";
import News from "@/models/News";
import { ensureDefaultData } from "@/lib/init-defaults";
import { getDictionary } from "@/lib/i18n/get-dictionary";
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
    title: "Top Briefing — देश और दुनिया की ताज़ा ख़बरें | National & World News",
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

    const newsDocs = await News.find({ published: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return JSON.parse(JSON.stringify(newsDocs));
  } catch (error: unknown) {
    console.error("Failed to fetch homepage data:", error);
    return [];
  }
}

export default async function Home({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const allNews = await getHomepageData();

  // Curate news for each specific editorial beat matching the screenshot
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
      {/* 1. Top Utility Bar: Date, Time, Location Updated | Login/SignUp + Socials */}
      <TopBar />

      {/* 2. Main Red Header: Top Briefing logo, Home, Categories ▾, Hindi categories, Search, ! SUBSCRIBE */}
      <PremiumHeader />

      {/* 3. Breaking News Ticker: ! BREAKING NEWS red pill, scrolling text, < > arrows */}
      <BreakingNews news={allNews} locale={locale} />

      {/* Main Container */}
      <main className="container mx-auto max-w-7xl px-4 py-6">
        {/* Section 1: Hero Section (3 columns: 50% Featured Taxi/Rain Card | 25% 4 Stacked Cards | 25% 1-5 Trending Box) */}
        <HeroSpotlight news={allNews} locale={locale} />

        {/* Section 2: "ताज़ा न्यूज़" (4 News Cards with red badges + 1 Square Ad card on right) */}
        <LatestNewsWithAd news={allNews} locale={locale} title="ताज़ा न्यूज़" />

        {/* Section 3: "कैटेगरी अनुसार खबरें (News By Categories)" */}
        <LatestNewsWithAd
          news={allNews.slice(2)}
          locale={locale}
          title="कैटेगरी अनुसार खबरें (News By Categories)"
        />

        {/* Section 4: "🏏 खेल" (Sports News - 4 Cards Grid) */}
        <TopBriefingSectionGrid
          iconEmoji="🏏"
          title="खेल"
          categorySlug="sports"
          news={fillToFour(sportsNews)}
          locale={locale}
        />

        {/* Section 5: "📈 बिजनेस" (Business News - 4 Cards Grid with stock market charts) */}
        <TopBriefingSectionGrid
          iconEmoji="📈"
          title="बिजनेस"
          categorySlug="business"
          news={fillToFour(businessNews)}
          locale={locale}
        />

        {/* Section 6: "💻 टेक्नोलॉजी" (Technology News - 4 Cards Grid + 2 Bottom Load More buttons) */}
        <TopBriefingSectionGrid
          iconEmoji="💻"
          title="टेक्नोलॉजी"
          categorySlug="technology"
          news={fillToFour(techNews)}
          locale={locale}
          showLoadMoreButtons={true}
        />

        {/* Section 7: "वीडियो अपडेट्स" (3 Video Cards with centered red Play button + 1 Newsletter Card) */}
        <VideoHub news={allNews} locale={locale} />
      </main>

      {/* 4. Dark Footer (Top Briefing logo, contact email, Android App button, Category counts, 5 Recent news with thumbnails) */}
      <Footer />
    </div>
  );
}
