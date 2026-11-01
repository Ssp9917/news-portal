import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GlobalSeo from "@/models/GlobalSeo";
import News from "@/models/News";
import { authenticateRequest } from "@/lib/auth/require-auth";
import { ensureDefaultData } from "@/lib/init-defaults";

export async function GET() {
  try {
    await connectDB();
    await ensureDefaultData();
    let seo = await GlobalSeo.findOne().sort({ updatedAt: -1 });
    if (!seo) {
      seo = await GlobalSeo.create({});
    }

    // Comprehensive SEO Health Audit across all published articles
    const articles = await News.find({ published: true }).select(
      "title slug excerpt image seo views createdAt tags"
    );

    const issues: {
      type: "warning" | "error" | "info";
      code: string;
      message: string;
      articleId?: string;
      articleTitle?: string;
    }[] = [];

    const titleMap: Record<string, number> = {};

    let totalArticles = articles.length;
    let compliantArticles = 0;

    for (const art of articles) {
      let isArticleClean = true;
      const effectiveTitle = art.seo?.title || art.title || "";
      const effectiveDesc = art.seo?.description || art.excerpt || "";

      // Check duplicate titles
      titleMap[effectiveTitle] = (titleMap[effectiveTitle] || 0) + 1;
      if (titleMap[effectiveTitle] > 1) {
        issues.push({
          type: "error",
          code: "DUPLICATE_TITLE",
          message: `Duplicate title found: "${effectiveTitle.slice(0, 40)}..."`,
          articleId: String(art._id),
          articleTitle: art.title,
        });
        isArticleClean = false;
      }

      // Title length checks (30 - 65 chars recommended)
      if (effectiveTitle.length < 25) {
        issues.push({
          type: "warning",
          code: "SHORT_TITLE",
          message: `Title is too short (${effectiveTitle.length} chars). Recommend 40-60 characters for optimal CTR.`,
          articleId: String(art._id),
          articleTitle: art.title,
        });
        isArticleClean = false;
      } else if (effectiveTitle.length > 70) {
        issues.push({
          type: "warning",
          code: "LONG_TITLE",
          message: `Title is long (${effectiveTitle.length} chars) and may be truncated on Google SERPs.`,
          articleId: String(art._id),
          articleTitle: art.title,
        });
      }

      // Meta description checks (70 - 160 chars recommended)
      if (!effectiveDesc || effectiveDesc.length < 50) {
        issues.push({
          type: "error",
          code: "MISSING_OR_SHORT_META_DESC",
          message: `Meta description is missing or too short (${effectiveDesc.length || 0} chars). Recommended: 120-160 chars.`,
          articleId: String(art._id),
          articleTitle: art.title,
        });
        isArticleClean = false;
      }

      // Image presence & OG Image
      if (!art.image || art.image.includes("placehold.co")) {
        issues.push({
          type: "warning",
          code: "DEFAULT_OR_MISSING_IMAGE",
          message: `Article uses a placeholder image or has no high-res thumbnail.`,
          articleId: String(art._id),
          articleTitle: art.title,
        });
        isArticleClean = false;
      }

      // Tags presence
      if (!art.tags || art.tags.length === 0) {
        issues.push({
          type: "info",
          code: "NO_TAGS",
          message: `Article has no topic tags assigned.`,
          articleId: String(art._id),
          articleTitle: art.title,
        });
      }

      if (isArticleClean) compliantArticles++;
    }

    const healthScore =
      totalArticles > 0
        ? Math.max(
            15,
            Math.round(
              (compliantArticles / totalArticles) * 100 -
                issues.filter((i) => i.type === "error").length * 5
            )
          )
        : 100;

    return NextResponse.json({
      seo,
      audit: {
        healthScore: Math.min(100, Math.max(0, healthScore)),
        totalArticles,
        compliantArticles,
        issuesCount: issues.length,
        errorsCount: issues.filter((i) => i.type === "error").length,
        warningsCount: issues.filter((i) => i.type === "warning").length,
        issues: issues.slice(0, 50),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req, "seo:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const data = await req.json();

    let seo = await GlobalSeo.findOne().sort({ updatedAt: -1 });
    if (seo) {
      Object.assign(seo, data);
      await seo.save();
    } else {
      seo = (await GlobalSeo.create(data)) as any;
    }

    return NextResponse.json({
      message: "Global SEO settings updated successfully",
      seo,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
