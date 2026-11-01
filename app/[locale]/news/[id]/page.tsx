import TopBar from "@/components/TopBar";
import PremiumHeader from "@/components/PremiumHeader";
import Footer from "@/components/Footer";
import connectDB from "@/lib/db";
import News from "@/models/News";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import mongoose from "mongoose";
import {
  User,
  Clock,
  ArrowLeft,
  Eye,
  Calendar,
  Share2,
  ChevronRight,
  Sparkles,
  Flame,
  ArrowRight,
} from "lucide-react";

import ReadingProgressBar from "@/components/article/ReadingProgressBar";
import SocialShareBar from "@/components/article/SocialShareBar";
import ArticleInteractionBar from "@/components/article/ArticleInteractionBar";
import ArticleComments from "@/components/article/ArticleComments";
import PromotionalBannerSlot from "@/components/promotions/PromotionalBannerSlot";
import ArticleBodyContainer from "@/components/article/ArticleBodyContainer";
import AdPlacement from "@/components/homepage/AdPlacement";
import NewsletterBox from "@/components/homepage/NewsletterBox";
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
      news = await News.findById(id).lean();
    }
    if (!news) {
      news = await News.findOne({ slug: id }).lean();
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
      published: { $ne: false },
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();
    return JSON.parse(JSON.stringify(related));
  } catch (error) {
    console.error("Error fetching related news:", error);
    return [];
  }
}

async function getTrendingSidebar(currentId: string) {
  try {
    await connectDB();
    const trending = await News.find({
      _id: { $ne: currentId },
      published: { $ne: false },
    })
      .sort({ views: -1, createdAt: -1 })
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(trending));
  } catch {
    return [];
  }
}

function getYouTubeId(url?: string) {
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
  const path = `/news/${news.slug || id}`;
  const title = news.seo?.title || getLocalizedTitle(news, locale);
  const description = news.seo?.description || getLocalizedExcerpt(news, locale);
  const ogImg = news.seo?.ogImage || news.image || `${site}/og-default.png`;

  return {
    title: `${title} | ${dict.site?.brandTitle || "Daily Latest News"}`,
    description,
    alternates: {
      canonical: `${site}/${locale}${path}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${site}/${l}${path}`])
      ) as Record<string, string>,
    },
    openGraph: {
      title,
      description,
      url: `${site}/${locale}${path}`,
      siteName: dict.site?.brandTitle || "Daily Latest News",
      images: [
        {
          url: ogImg,
          width: 1200,
          height: 630,
          alt: title,
        },
        ...previousImages,
      ],
      type: "article",
      publishedTime: news.createdAt,
      modifiedTime: news.updatedAt || news.createdAt,
      authors: [news.author],
      locale: locale === "hi" ? "hi_IN" : locale === "bn" ? "bn_BD" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImg],
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

  const [relatedNews, trendingSidebar] = await Promise.all([
    getRelatedNews(news.category, news._id),
    getTrendingSidebar(news._id),
  ]);

  const title = getLocalizedTitle(news, locale);
  const subtitle = news.subtitle || "";
  const excerpt = getLocalizedExcerpt(news, locale);
  const contentHtml = getLocalizedContent(news, locale) || `<p>${excerpt}</p>`;

  const categoryLabel = categoryLabelForLocale(
    news.category,
    locale,
    (key) => pickMessage(dict, key)
  );

  const siteUrl = getSiteUrl();
  const canonicalPath = withLocale(locale, `/news/${news.slug || id}`);
  const currentFullUrl = `${siteUrl}${canonicalPath}`;

  // Structured Data Schema for NewsArticle & BreadcrumbList
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        headline: title,
        description: excerpt,
        image: news.image ? [news.image] : [`${siteUrl}/og-default.png`],
        datePublished: news.createdAt,
        dateModified: news.updatedAt ?? news.createdAt,
        author: {
          "@type": "Person",
          name: news.author,
          jobTitle: news.authorBio || "Journalist",
        },
        publisher: {
          "@type": "Organization",
          name: dict.site?.brandTitle || "Daily Latest News",
          logo: { "@type": "ImageObject", url: `${siteUrl}/favicon.svg` },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": currentFullUrl,
        },
        articleSection: categoryLabel,
        inLanguage: locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-BD" : "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: locale === "hi" ? "मुखपृष्ठ" : "Home",
            item: `${siteUrl}/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: categoryLabel,
            item: `${siteUrl}/${locale}/category/${encodeURIComponent(news.category)}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: title,
            item: currentFullUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Sticky Reading Progress Bar */}
      <ReadingProgressBar />

      {/* 2. Top Info Bar & Header */}
      <TopBar />
      <PremiumHeader />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Breadcrumb Hierarchy */}
        <nav className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link
            href={withLocale(locale, "/")}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {locale === "hi" ? "मुखपृष्ठ" : "Home"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link
            href={withLocale(locale, `/category/${news.category}`)}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {categoryLabel}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="truncate max-w-xs text-slate-800 dark:text-slate-200">
            {title}
          </span>
        </nav>

        {/* Article Headline Header */}
        <header className="mb-8 max-w-4xl">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow ${
                news.categoryColor || "bg-blue-600"
              }`}
            >
              {categoryLabel}
            </span>
            {news.isBreaking && (
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white animate-pulse">
                BREAKING
              </span>
            )}
          </div>

          <h1
            className="text-3xl font-black leading-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl"
            style={{
              fontFamily:
                locale === "hi"
                  ? "var(--font-noto-serif-devanagari), Georgia, serif"
                  : "Georgia, serif",
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p className="mt-4 text-xl font-medium leading-relaxed text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          )}

          {/* Author Byline & Social Bar */}
          <div className="mt-6 flex flex-col gap-4 border-y border-slate-200/80 dark:border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Byline Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold shadow-md">
                {news.author?.[0] || "A"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {news.author}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {news.date}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span className="font-mono text-cyan-600 dark:text-cyan-400">
                    ~{news.readingTime || 3} min read
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Eye className="h-3.5 w-3.5" />
                    {(news.views || 0).toLocaleString()} views
                  </span>
                </div>
              </div>
            </div>

            <ViewCounter id={news._id} />

            {/* Social Share & Bookmark Bar with Auto Reading History */}
            <ArticleInteractionBar
              articleId={news._id}
              title={title}
              category={news.category}
              image={news.image}
              url={currentFullUrl}
            />
          </div>
        </header>

        {/* Featured Image & Video Banner */}
        <div className="mb-10 max-w-4xl">
          {news.videoUrl && getYouTubeId(news.videoUrl) ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black shadow-2xl mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(news.videoUrl)}`}
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          ) : (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-slate-900 shadow-xl">
              <img
                src={news.image || "https://placehold.co/1200x800"}
                alt={`${title} — भारत पल्स (Bharat Pulse)`}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Caption & Photo Credit */}
          {(news.imageCaption || news.imageCredit) && (
            <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2 italic">
              <span>{news.imageCaption}</span>
              {news.imageCredit && (
                <span className="font-mono font-semibold uppercase not-italic">
                  फोटो: {news.imageCredit}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Two-Column Layout: Article Body (8 cols) + Sticky Editorial Sidebar (4 cols) */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main Column */}
          <div className="lg:col-span-8">
            <ArticleBodyContainer contentHtml={contentHtml} />

            {/* In-Article Promotional Campaign Slot */}
            <div className="my-8">
              <PromotionalBannerSlot placement="in_article" />
            </div>

            {/* Tags Pills */}
            <div className="mt-10 border-t border-slate-200/80 dark:border-white/10 pt-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Related Topics
              </span>
              <div className="flex flex-wrap gap-2">
                {news.tags && news.tags.length > 0 ? (
                  news.tags.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      #{tag.replace(/^#/, "")}
                    </span>
                  ))
                ) : (
                  ["#news", `#${news.category}`].map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
                    >
                      {tag}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Social Share */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/50 p-5 backdrop-blur-md">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Did you find this story informative? Share it with your network:
              </span>
              <SocialShareBar title={title} url={currentFullUrl} />
            </div>

            {/* Author Profile Bio Box */}
            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-6 backdrop-blur-md shadow-sm">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-extrabold text-xl shadow-lg shadow-blue-500/25">
                {news.author?.[0] || "A"}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {news.author}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {news.authorBio ||
                    "वरिष्ठ पत्रकार एवं राजनीतिक विश्लेषक। राष्ट्रीय राजनीति, संसद और नीतिगत मामलों पर स्वतंत्र और निष्पक्ष रिपोर्टिंग।"}
                </p>
              </div>
            </div>

            {/* Reader Comments & Moderated Discussion */}
            <div className="mt-10">
              <ArticleComments articleId={news._id} articleSlug={news.slug || news._id} />
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="space-y-6 lg:col-span-4">
            {/* Sidebar Sticky Ad */}
            <AdPlacement slot="article_sidebar" />

            {/* Trending Reader Favorites Widget */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-5 backdrop-blur-md shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/80 dark:border-white/10">
                <Flame className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Trending Stories
                </h3>
              </div>

              <div className="space-y-4">
                {trendingSidebar.map((item: any, i: number) => (
                  <Link
                    key={item._id}
                    href={withLocale(locale, `/news/${item.slug || item._id}`)}
                    className="group flex items-start gap-3 transition-colors"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                      0{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold leading-snug text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                        {getLocalizedTitle(item, locale) || item.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                        {(item.views || 0).toLocaleString()} reads
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Compact Newsletter Widget */}
            <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-950/40 to-slate-950/60 p-5 backdrop-blur-md text-white">
              <Sparkles className="h-5 w-5 text-cyan-400 mb-2" />
              <h4 className="text-sm font-bold">Never Miss Bharat Pulse Updates</h4>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Get the top verified stories delivered to your inbox every morning.
              </p>
              <a
                href="#newsletter-subscribe"
                className="mt-3 block text-center rounded-xl bg-blue-600 py-2 text-xs font-bold text-white shadow hover:bg-blue-500 transition-colors"
              >
                Join Free Dispatch →
              </a>
            </div>
          </aside>
        </div>

        {/* Related News Grid */}
        {relatedNews.length > 0 && (
          <section className="mt-16 border-t border-slate-200/80 dark:border-white/10 pt-10">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {dict.article?.related || "संबंधित समाचार (Related Stories)"}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {relatedNews.map((item: any) => {
                const relatedTitle = getLocalizedTitle(item, locale) || item.title;
                const relatedHref = withLocale(locale, `/news/${item.slug || item._id}`);

                return (
                  <Link
                    key={item._id}
                    href={relatedHref}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 p-4 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/30"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-800 mb-3">
                        <img
                          src={item.image || "https://placehold.co/600x400"}
                          alt={`${relatedTitle} — भारत पल्स (Bharat Pulse)`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1.5">
                        <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">
                          {categoryLabelForLocale(item.category, locale, (k) => pickMessage(dict, k))}
                        </span>
                        <span>•</span>
                        <span>{item.date}</span>
                      </div>
                      <h4 className="text-sm font-bold leading-snug text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {relatedTitle}
                      </h4>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
