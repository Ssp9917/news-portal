import type { Metadata } from "next";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import connectDB from "@/lib/db";
import News from "@/models/News";
import BreakingNews from "@/components/BreakingNews";
import NewsFeed from "@/components/NewsFeed";
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
  const dict = await getDictionary(locale);
  const site = getSiteUrl();

  return {
    title: dict.meta.defaultTitle,
    description: dict.meta.defaultDescription,
    alternates: {
      canonical: `${site}/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `${site}/${l}`])) as Record<
        string,
        string
      >,
    },
  };
}

async function getNews() {
  try {
    await connectDB();
    const news = await News.find({}).sort({ createdAt: -1 }).limit(8);
    return JSON.parse(JSON.stringify(news));
  } catch (error: unknown) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

export default async function Home({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const newsVideoData = await getNews();
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      <Header />
      <Navbar />

      <BreakingNews
        news={Array.isArray(newsVideoData) ? newsVideoData : []}
        locale={locale}
        breakingLabel={dict.breaking.label}
      />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <HeroSection
          news={Array.isArray(newsVideoData) ? newsVideoData : []}
        />

        <NewsFeed
          locale={locale}
          initialNews={Array.isArray(newsVideoData) ? newsVideoData : []}
        />
      </main>

      <Footer />
    </div>
  );
}
