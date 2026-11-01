import type { Metadata } from "next";
import TopBar from "@/components/TopBar";
import PremiumHeader from "@/components/PremiumHeader";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import connectDB from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";
import {
  getDbCategoryFromSlug,
  categoryLabelForLocale,
} from "@/lib/i18n/categories";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/site-url";
import { pickMessage } from "@/lib/i18n/pick-message";
import { notFound } from "next/navigation";
import { FolderTree, Sparkles } from "lucide-react";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamic = "force-dynamic";

async function getNewsByDbCategory(category: string, slug: string) {
  try {
    await connectDB();
    const news = await News.find({
      $or: [
        { category },
        { category: slug },
        { slug: new RegExp(slug, "i") },
      ],
      published: { $ne: false },
    }).sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(news));
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  const { locale: raw, slug } = resolved;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dbCategory = getDbCategoryFromSlug(slug) || slug;

  const dict = await getDictionary(locale);
  const t = (key: string) => pickMessage(dict, key);

  const label = categoryLabelForLocale(dbCategory, locale, t);
  const site = getSiteUrl();
  const path = `/${locale}/category/${slug}`;

  return {
    title: `${label} | ${dict.site?.brandTitle || "Daily Latest News"}`,
    description: `${dict.meta.defaultDescription} — ${label}`,
    alternates: {
      canonical: `${site}${path}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${site}/${l}/category/${slug}`])
      ) as Record<string, string>,
    },
    openGraph: {
      url: `${site}${path}`,
      title: label,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const resolved = await params;
  const { locale: raw, slug } = resolved;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const dbCategory = getDbCategoryFromSlug(slug) || slug;
  const dict = await getDictionary(locale);
  const categoryTitle = categoryLabelForLocale(dbCategory, locale, (key) =>
    pickMessage(dict, key)
  );

  const newsVideoData = await getNewsByDbCategory(dbCategory, slug);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <TopBar />
      <PremiumHeader />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Category Header Banner */}
        <div className="mb-10 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/40 p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex h-3 w-3 rounded-full bg-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              Beat / Category Archive
            </span>
          </div>

          <h1
            className="text-3xl font-black text-slate-900 dark:text-white sm:text-4xl lg:text-5xl"
            style={{
              fontFamily:
                locale === "hi"
                  ? "var(--font-noto-serif-devanagari), Georgia, serif"
                  : "Georgia, serif",
            }}
          >
            {categoryTitle}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            {dict.meta?.defaultDescription || "ताज़ा समाचार और गहन संपादकीय विश्लेषण।"}
          </p>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {newsVideoData.length > 0 ? (
            newsVideoData.map((news: any, idx: number) => (
              <NewsCard
                key={news._id ? String(news._id) : String(idx)}
                locale={locale}
                {...news}
              />
            ))
          ) : (
            <div className="col-span-full py-24 text-center rounded-3xl border border-dashed border-slate-200 dark:border-white/10 p-12">
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                {dict.category?.emptyTitle || "इस श्रेणी में अभी कोई खबर नहीं है।"}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {dict.category?.emptyHint || "एडमिन पैनल से खबर जोड़ें।"}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
