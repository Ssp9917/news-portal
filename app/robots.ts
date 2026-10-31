import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: [
          "Googlebot",
          "Google-Extended",
          "Bingbot",
          "Slurp",
          "DuckDuckBot",
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "PerplexityBot",
          "Applebot",
          "Applebot-Extended",
          "cohere-ai",
          "Amazonbot",
        ],
        allow: ["/", "/hi/", "/en/", "/bn/", "/category/", "/news/"],
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
