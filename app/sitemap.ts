import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { CATEGORY_SLUGS } from "@/lib/i18n/categories";
import { locales } from "@/lib/i18n/config";
import connectDB from "@/lib/db";
import News from "@/models/News";

async function getPublishedNewsSlugs(): Promise<{ slug: string; updatedAt?: string }[]> {
  try {
    await connectDB();
    const news = await News.find(
      { published: { $ne: false } },
      { slug: 1, updatedAt: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    return news.map((n) => ({
      slug: (n as { slug: string; updatedAt?: Date; createdAt?: Date }).slug,
      updatedAt: ((n as { updatedAt?: Date }).updatedAt ?? (n as { createdAt?: Date }).createdAt)?.toISOString(),
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // ── Static pages ──────────────────────────────────────
  for (const locale of locales) {
    // Home
    entries.push({
      url: `${base}/${locale}`,
      lastModified,
      changeFrequency: "hourly",
      priority: locale === "bn" ? 1 : 0.9,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}`])),
      },
    });

    // Category pages
    for (const slug of CATEGORY_SLUGS) {
      entries.push({
        url: `${base}/${locale}/category/${slug}`,
        lastModified,
        changeFrequency: "daily",
        priority: 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${base}/${l}/category/${slug}`])
          ),
        },
      });
    }

    // Search
    entries.push({
      url: `${base}/${locale}/search`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.3,
    });
  }

  // ── Dynamic news articles ──────────────────────────────
  const newsList = await getPublishedNewsSlugs();

  for (const { slug, updatedAt } of newsList) {
    if (!slug) continue;
    for (const locale of locales) {
      entries.push({
        url: `${base}/${locale}/news/${slug}`,
        lastModified: updatedAt ? new Date(updatedAt) : lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${base}/${l}/news/${slug}`])
          ),
        },
      });
    }
  }

  return entries;
}
