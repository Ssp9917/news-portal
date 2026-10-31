import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import News from "@/models/News";
import GlobalSeo from "@/models/GlobalSeo";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    let siteTitle = "Bharat Pulse | भारत पल्स";
    const seo = await GlobalSeo.findOne().sort({ updatedAt: -1 });
    if (seo?.siteTitle) siteTitle = seo.siteTitle;

    const siteUrl = getSiteUrl();

    // Google News sitemap standard: articles published within the last 48 hours
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    let articles = await News.find({
      published: true,
      createdAt: { $gte: twoDaysAgo },
    })
      .sort({ createdAt: -1 })
      .limit(100);

    if (articles.length === 0) {
      // Fallback to recent published articles
      articles = await News.find({ published: true })
        .sort({ createdAt: -1 })
        .limit(20);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles
  .map((art) => {
    const slug = art.slug || String(art._id);
    const loc = `${siteUrl}/hi/news/${slug}`;
    const pubDate = new Date(art.createdAt || Date.now()).toISOString();
    const title = (art.seo?.title || art.title || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>${siteTitle.replace(/&/g, "&amp;")}</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
  })
  .join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return new NextResponse(`<error>${message}</error>`, { status: 500 });
  }
}
