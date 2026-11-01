import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import News from "@/models/News";
import { authenticateRequest } from "@/lib/auth/require-auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

// Helper to query news by ObjectId or slug
async function findArticle(idOrSlug: string) {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const doc = await News.findById(idOrSlug);
    if (doc) return doc;
  }
  return await News.findOne({ slug: idOrSlug });
}

// GET /api/news/[id]/like - Check current like count and whether current user has liked
export async function GET(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    await connectDB();

    const article = await findArticle(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const auth = authenticateRequest(req);
    const userId = auth.authorized && auth.user ? auth.user.userId : null;

    const hasLiked = Boolean(
      userId && Array.isArray(article.likedBy) && article.likedBy.includes(userId)
    );

    return NextResponse.json({
      success: true,
      likes: article.likes || 0,
      hasLiked,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/news/[id]/like - Like / Unlike (STRICTLY LOGIN REQUIRED)
export async function POST(req: Request, { params }: Props) {
  try {
    // 1. Strict Authentication Check
    const auth = authenticateRequest(req);
    if (!auth.authorized || !auth.user?.userId) {
      return NextResponse.json(
        {
          error: "कृपया इस पोस्ट को लाइक करने के लिए पहले लॉगिन करें। (Login required to like this post)",
          loginRequired: true,
        },
        { status: 401 }
      );
    }

    const userId = auth.user.userId;
    const { id } = await params;
    await connectDB();

    const article = await findArticle(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    if (!Array.isArray(article.likedBy)) {
      article.likedBy = [];
    }

    const alreadyLikedIndex = article.likedBy.indexOf(userId);
    let hasLiked = false;
    let message = "";

    if (alreadyLikedIndex > -1) {
      // Toggle off / Unlike
      article.likedBy.splice(alreadyLikedIndex, 1);
      article.likes = Math.max(0, (article.likes || 1) - 1);
      hasLiked = false;
      message = "लाइक हटा दिया गया (Post unliked)";
    } else {
      // Like
      article.likedBy.push(userId);
      article.likes = (article.likes || 0) + 1;
      hasLiked = true;
      message = "पोस्ट को लाइक किया गया! (Post liked successfully)";
    }

    await article.save();

    return NextResponse.json({
      success: true,
      likes: article.likes,
      hasLiked,
      message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
