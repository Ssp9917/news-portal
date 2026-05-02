import type { Metadata } from "next";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";
import connectDB from "@/lib/db";
import News from "@/models/News";
import {
  getDbCategoryFromSlug,
  categoryLabelForLocale,
} from "@/lib/i18n/categories";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/site-url";
import { pickMessage } from "@/lib/i18n/pick-message";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamic = "force-dynamic";

async function getNewsByDbCategory(category: string) {
  try {
    await connectDB();
    const news = await News.find({ category }).sort({ createdAt: -1 });
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
  const dbCategory = getDbCategoryFromSlug(slug);
  if (!dbCategory) return {};

  const dict = await getDictionary(locale);
  const t = (key: string) => pickMessage(dict, key);

  const label = categoryLabelForLocale(dbCategory, locale, t);
  const site = getSiteUrl();
  const path = `/${locale}/category/${slug}`;

  return {
    title: label,
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

  const dbCategory = getDbCategoryFromSlug(slug);
  if (!dbCategory) notFound();

  const dict = await getDictionary(locale);
  const categoryTitle = categoryLabelForLocale(dbCategory, locale, (key) =>
    pickMessage(dict, key)
  );

  const newsVideoData = await getNewsByDbCategory(dbCategory);

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      <Header />
      <Navbar />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 border-b border-gray-100 pb-2 dark:border-neutral-800">
          <h1 className="-mb-3.5 inline-block border-b-4 border-[#D32F2F] pb-2 text-3xl font-bold text-[#D32F2F]">
            {categoryTitle}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {newsVideoData.length > 0 ? (
            newsVideoData.map((news: Record<string, unknown>, idx: number) => (
              <NewsCard
                key={(news._id as string) ?? String(idx)}
                locale={locale}
                {...news}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl text-gray-500 dark:text-neutral-400">
                {dict.category.emptyTitle}
              </p>
              <p className="mt-2 text-sm text-gray-400 dark:text-neutral-500">
                {dict.category.emptyHint}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
