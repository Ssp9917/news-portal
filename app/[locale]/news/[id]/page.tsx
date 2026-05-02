import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import connectDB from "@/lib/db";
import News from "@/models/News";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import mongoose from "mongoose";
import { User, Clock, ArrowLeft, Printer, Eye } from "lucide-react";

import ShareButtons from "@/components/ShareButtons";
import NewsGallery from "@/components/NewsGallery";
import ViewCounter from "@/components/ViewCounter";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { pickMessage } from "@/lib/i18n/pick-message";
import { categoryLabelForLocale } from "@/lib/i18n/categories";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/site-url";
import { withLocale } from "@/lib/i18n/paths";
import {
  getLocalizedContent,
  getLocalizedExcerpt,
  getLocalizedTitle,
} from "@/lib/i18n/news-fields";

interface NewsDetailsPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export const dynamic = "force-dynamic";

async function getNewsDetail(id: string) {
  try {
    await connectDB();

    let news = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      news = await News.findById(id);
    }

    if (!news) {
      news = await News.findOne({ slug: id });
    }

    if (!news) return null;
    return JSON.parse(JSON.stringify(news));
  } catch {
    return null;
  }
}

async function getRelatedNews(category: string, currentId: string) {
  try {
    await connectDB();
    const related = await News.find({
      category: category,
      _id: { $ne: currentId },
    })
      .sort({ createdAt: -1 })
      .limit(3);

    return JSON.parse(JSON.stringify(related));
  } catch (error) {
    console.error("Error fetching related news:", error);
    return [];
  }
}

function getYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export async function generateMetadata(
  { params }: NewsDetailsPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const { locale: raw, id } = resolvedParams;
  if (!isLocale(raw)) return { title: "Not found" };
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const site = getSiteUrl();
  const news = await getNewsDetail(id);

  if (!news) {
    return {
      title: pickMessage(dict, "search.noResults"),
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const path = `/news/${id}`;
  const languages = Object.fromEntries(
    locales.map((l) => [l, `${site}/${l}${path}`])
  ) as Record<string, string>;

  return {
    title: getLocalizedTitle(news, locale),
    description: getLocalizedExcerpt(news, locale),
    alternates: {
      canonical: `${site}/${locale}${path}`,
      languages,
    },
    openGraph: {
      title: getLocalizedTitle(news, locale),
      description: getLocalizedExcerpt(news, locale),
      url: `${site}/${locale}${path}`,
      siteName: dict.site.brandTitle,
      images: [
        {
          url: news.image || "https://placehold.co/1200x630/png?text=No+Image",
          width: 1200,
          height: 630,
          alt: getLocalizedTitle(news, locale),
        },
        ...previousImages,
      ],
      type: "article",
      publishedTime: news.createdAt,
      authors: [news.author],
      locale:
        locale === "bn"
          ? "bn_BD"
          : locale === "hi"
            ? "hi_IN"
            : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: getLocalizedTitle(news, locale),
      description: getLocalizedExcerpt(news, locale),
      images: [news.image || "https://placehold.co/1200x630/png?text=No+Image"],
    },
  };
}

export default async function NewsDetailsPage({ params }: NewsDetailsPageProps) {
  const resolvedParams = await params;
  const { locale: raw, id } = resolvedParams;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const dict = await getDictionary(locale);
  const news = await getNewsDetail(id);

  if (!news) {
    notFound();
  }

  const relatedNews = await getRelatedNews(news.category, news._id);
  const title = getLocalizedTitle(news, locale);
  const excerpt = getLocalizedExcerpt(news, locale);
  const contentHtml = getLocalizedContent(news, locale) || `<p>${excerpt}</p>`;

  const categoryLabel = categoryLabelForLocale(
    news.category,
    locale,
    (key) => pickMessage(dict, key)
  );

  const siteUrl = getSiteUrl();
  const canonicalPath = withLocale(locale, `/news/${id}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: excerpt,
    image: news.image ? [news.image, ...(news.gallery || [])].filter(Boolean) : undefined,
    datePublished: news.createdAt,
    dateModified: news.updatedAt ?? news.createdAt,
    author: { "@type": "Person", name: news.author },
    publisher: {
      "@type": "Organization",
      name: dict.site.brandTitle,
      logo: { "@type": "ImageObject", url: `${siteUrl}/favicon.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteUrl}${canonicalPath}` },
    articleSection: categoryLabel,
    inLanguage: locale === "bn" ? "bn-BD" : locale === "hi" ? "hi-IN" : "en-US",
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <Navbar />

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <Link
            href={withLocale(locale, "/")}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-[#D32F2F] dark:text-neutral-400 dark:hover:text-red-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{dict.article.back}</span>
          </Link>
        </div>

        <div className="mb-8 max-w-4xl">
          <span
            className={`mb-4 inline-block rounded px-3 py-1 text-xs font-bold uppercase tracking-wider text-white ${news.categoryColor || "bg-[#D32F2F]"}`}
          >
            {categoryLabel}
          </span>
          <h1 className="mb-6 text-3xl font-bold leading-tight md:text-5xl">
            {title}
          </h1>

          <p className="mb-6 text-xl leading-relaxed text-gray-600 dark:text-neutral-300">
            {excerpt}
          </p>

          <div className="flex flex-col justify-between gap-6 border-y border-gray-100 py-4 dark:border-neutral-800 md:flex-row md:items-center">
            <div className="flex flex-col gap-6 text-sm text-gray-500 dark:text-neutral-400 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#D32F2F]" />
                <span className="font-medium text-gray-900 dark:text-neutral-100">
                  {news.author}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#D32F2F]" />
                <span>{news.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#D32F2F]" />
                <span>
                  {news.views ?? 0} {dict.article.views}
                </span>
              </div>
            </div>
            <ViewCounter id={news._id} />

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={withLocale(locale, `/news/${id}/print`)}
                className="group flex items-center gap-2 text-gray-500 transition-colors hover:text-[#D32F2F] dark:text-neutral-400"
                title={dict.article.printTooltip}
              >
                <Printer className="h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="text-sm font-medium">{dict.article.print}</span>
              </Link>

              <div className="hidden h-4 w-px bg-gray-300 sm:block dark:bg-neutral-600" />

              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 text-sm text-gray-400 dark:text-neutral-500">
                  {dict.article.share}:
                </span>
                <ShareButtons title={news.title} />
              </div>
            </div>
          </div>
        </div>

        {news.videoUrl && getYouTubeId(news.videoUrl) && (
          <div className="relative mb-10 aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${getYouTubeId(news.videoUrl)}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0"
            />
          </div>
        )}

        {(() => {
          const allImages = [...(news.image ? [news.image] : []), ...(news.gallery || [])].filter(
            Boolean
          );

          if (allImages.length > 0) {
            return <NewsGallery images={allImages} title={title} />;
          }

          return (
            <div className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm dark:bg-neutral-900">
              <Image
                src="https://placehold.co/1200x800/png"
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </div>
          );
        })()}

        <div className="max-w-4xl">
          <div
            className="prose prose-lg max-w-none leading-relaxed text-gray-800 dark:prose-invert dark:text-neutral-100"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          <div className="mt-10 border-t border-gray-100 py-6 dark:border-neutral-800">
            <div className="flex flex-wrap gap-2">
              {news.tags && news.tags.length > 0 ? (
                news.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="cursor-pointer rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    #{tag.replace(/^#/, "")}
                  </span>
                ))
              ) : (
                ["#news", `#${news.category}`].map((tag, i) => (
                  <span
                    key={i}
                    className="cursor-pointer rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-b border-gray-100 py-6 dark:border-neutral-800">
            <span className="font-bold text-gray-900 dark:text-neutral-100">
              {dict.article.share}:
            </span>
            <ShareButtons title={title} size="lg" />
          </div>
        </div>

        {relatedNews.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-10 dark:border-neutral-800">
            <h3 className="mb-8 border-l-4 border-[#D32F2F] pl-3 text-2xl font-bold">
              {dict.article.related}
            </h3>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {relatedNews.map((item: Record<string, unknown>) => (
                <Link
                  href={withLocale(locale, `/news/${(item.slug as string) || String(item._id)}`)}
                  key={String(item._id)}
                  className="group cursor-pointer"
                >
                  <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-lg bg-gray-200 dark:bg-neutral-800">
                    <Image
                      src={(item.image as string) || "https://placehold.co/600x400"}
                      alt={String(item.title)}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mb-2 flex gap-2 text-xs text-gray-500 dark:text-neutral-400">
                    <span className="font-bold uppercase text-[#D32F2F]">
                      {categoryLabelForLocale(String(item.category), locale, (k) =>
                        pickMessage(dict, k)
                      )}
                    </span>
                    <span>•</span>
                    <span>{String(item.date)}</span>
                  </div>
                  <h4 className="line-clamp-3 text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#D32F2F] dark:text-neutral-100">
                    {String(item.title)}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
