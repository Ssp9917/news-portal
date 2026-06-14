import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, "");
  return {
    rules: [
      {
        // Allow major crawlers full access to public content
        userAgent: ["Googlebot", "Bingbot", "Slurp", "DuckDuckBot"],
        allow: ["/bn/", "/en/", "/hi/"],
        disallow: ["/admin/", "/api/", "/_next/", "/fonts/"],
      },
      {
        // Block all other bots from admin / API
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/_next/static/"],
        crawlDelay: 2,
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}

