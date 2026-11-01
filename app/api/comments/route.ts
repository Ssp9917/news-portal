import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");
    const articleSlug = searchParams.get("articleSlug");

    if (!articleId && !articleSlug) {
      return NextResponse.json({ message: "Article ID or slug required" }, { status: 400 });
    }

    const query: Record<string, unknown> = { isApproved: true };
    if (articleId) query.articleId = articleId;
    else if (articleSlug) query.articleSlug = articleSlug;

    const comments = await Comment.find(query).sort({ createdAt: -1 }).limit(100).lean();

    return NextResponse.json({ comments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { articleId, articleSlug, content, authorName, authorEmail } = body;

    if (!articleId || !content || !authorName || !authorEmail) {
      return NextResponse.json(
        { message: "टिप्पणी, नाम और ईमेल आवश्यक हैं (All fields required)" },
        { status: 400 }
      );
    }

    // Optional user authentication
    const auth = authenticateRequest(req);
    const authorId = auth.authorized && auth.user ? auth.user.userId : null;

    // Basic profanity / spam check
    const isSpam =
      content.includes("http://") ||
      content.includes("https://") ||
      content.includes("casino") ||
      content.includes("viagra");

    const newComment = await Comment.create({
      articleId,
      articleSlug: articleSlug || articleId,
      authorId,
      authorName: authorName.trim(),
      authorEmail: authorEmail.toLowerCase().trim(),
      content: content.trim(),
      isApproved: !isSpam, // Auto-approve clean comments; flag spam
      reported: false,
    });

    return NextResponse.json(
      {
        message: isSpam
          ? "आपकी टिप्पणी मॉडरेशन के लिए भेज दी गई है।"
          : "आपकी टिप्पणी सफलतापूर्वक प्रकाशित हो गई!",
        comment: newComment,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { commentId, voterIdentifier } = await req.json();

    if (!commentId) {
      return NextResponse.json({ message: "Comment ID required" }, { status: 400 });
    }

    const id = voterIdentifier || "voter_" + Date.now();

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ message: "Comment not found" }, { status: 404 });
    }

    if (comment.likedByIdentifiers.includes(id)) {
      comment.likes = Math.max(0, comment.likes - 1);
      comment.likedByIdentifiers = comment.likedByIdentifiers.filter((v) => v !== id);
    } else {
      comment.likes += 1;
      comment.likedByIdentifiers.push(id);
    }

    await comment.save();

    return NextResponse.json({ likes: comment.likes });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

