import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import News from "@/models/News";
import { authenticateRequest } from "@/lib/auth/require-auth";

export const dynamic = "force-dynamic";

// GET /api/admin/comments - List and moderate reader comments
export async function GET(req: Request) {
  try {
    const auth = authenticateRequest(req, "comments:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    const query: Record<string, unknown> = {};

    if (status === "pending") {
      query.isApproved = false;
      query.reported = { $ne: true };
    } else if (status === "approved") {
      query.isApproved = true;
    } else if (status === "reported") {
      query.reported = true;
    }

    if (search.trim()) {
      query.$or = [
        { authorName: { $regex: search.trim(), $options: "i" } },
        { authorEmail: { $regex: search.trim(), $options: "i" } },
        { content: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [comments, totalAll, pendingCount, approvedCount, reportedCount] = await Promise.all([
      Comment.find(query).sort({ createdAt: -1 }).limit(100).lean(),
      Comment.countDocuments(),
      Comment.countDocuments({ isApproved: false, reported: { $ne: true } }),
      Comment.countDocuments({ isApproved: true }),
      Comment.countDocuments({ reported: true }),
    ]);

    // Fetch article titles for context
    const articleIds = Array.from(new Set(comments.map((c) => c.articleId).filter(Boolean)));
    const articles = await News.find({ _id: { $in: articleIds } })
      .select("title slug")
      .lean();

    const articleMap = new Map(articles.map((a) => [String(a._id), a]));

    const enrichedComments = comments.map((c) => {
      const art = articleMap.get(String(c.articleId));
      return {
        ...c,
        articleTitle: art?.title || c.articleSlug || "Unknown Story",
        articleSlug: art?.slug || c.articleSlug,
      };
    });

    return NextResponse.json({
      success: true,
      comments: enrichedComments,
      stats: {
        total: totalAll,
        pending: pendingCount,
        approved: approvedCount,
        reported: reportedCount,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/comments - Approve, reject, or flag a comment
export async function PATCH(req: Request) {
  try {
    const auth = authenticateRequest(req, "comments:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const body = await req.json();
    const { commentId, isApproved, reported } = body;

    if (!commentId) {
      return NextResponse.json({ error: "commentId is required" }, { status: 400 });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (typeof isApproved === "boolean") {
      comment.isApproved = isApproved;
    }
    if (typeof reported === "boolean") {
      comment.reported = reported;
    }

    await comment.save();

    return NextResponse.json({
      success: true,
      message: isApproved ? "टिप्पणी स्वीकृत कर दी गई (Comment approved)" : "टिप्पणी रोकी गई (Comment rejected)",
      comment,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/comments - Delete a comment
export async function DELETE(req: Request) {
  try {
    const auth = authenticateRequest(req, "comments:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("id");

    if (!commentId) {
      return NextResponse.json({ error: "id parameter is required" }, { status: 400 });
    }

    const deleted = await Comment.findByIdAndDelete(commentId);
    if (!deleted) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    // Decrement commentsCount on News
    if (deleted.articleId) {
      try {
        await News.findByIdAndUpdate(deleted.articleId, { $inc: { commentsCount: -1 } });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: "टिप्पणी सफलतापूर्वक हटा दी गई (Comment deleted)",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
