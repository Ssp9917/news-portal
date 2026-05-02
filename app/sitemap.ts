import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { CATEGORY_SLUGS } from "@/lib/i18n/categories";
import { locales } from "@/lib/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    entries.push({
      url: `${base}/${locale}`,
      lastModified,
      priority: locale === "bn" ? 1 : 0.9,
    });

    for (const slug of CATEGORY_SLUGS) {
      entries.push({
        url: `${base}/${locale}/category/${slug}`,
        lastModified,
        priority: 0.7,
      });
    }

    entries.push({
      url: `${base}/${locale}/search`,
      lastModified,
      priority: 0.3,
    });
  }

  return entries;
}
