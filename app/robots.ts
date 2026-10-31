import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: ["Googlebot", "Bingbot", "Slurp", "DuckDuckBot"],
        allow: ["/hi/", "/en/", "/bn/"],
        disallow: ["/admin/", "/api/", "/_next/", "/fonts/"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/_next/static/"],
        crawlDelay: 2,
      },
    ],
    sitemap: [`${base}/sitemap.xml`, `${base}/news-sitemap.xml`],
    host: base,
  };
}
