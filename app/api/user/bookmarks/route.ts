import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import News from "@/models/News";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function GET(req: Request) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ bookmarks: [] }, { status: 200 });
    }

    await connectDB();
    const user = await User.findById(auth.user.userId).select("bookmarks").lean();
    if (!user || !user.bookmarks || user.bookmarks.length === 0) {
      return NextResponse.json({ bookmarks: [], articles: [] });
    }

    // Fetch full news cards for bookmarked items
    const articles = await News.find({
      $or: [
        { slug: { $in: user.bookmarks } },
        { _id: { $in: user.bookmarks.filter((b) => b.match(/^[0-9a-fA-F]{24}$/)) } },
      ],
      published: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      bookmarks: user.bookmarks,
      articles,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { message: "कृपया बुकमार्क करने के लिए लॉगिन करें (Login required to bookmark)" },
        { status: 401 }
      );
    }

    await connectDB();
    const { newsId } = await req.json();

    if (!newsId) {
      return NextResponse.json({ message: "Article ID/slug required" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      auth.user.userId,
      { $addToSet: { bookmarks: newsId } },
      { new: true }
    ).select("bookmarks");

    return NextResponse.json({
      message: "लेख बुकमार्क में जोड़ दिया गया है (Saved to bookmarks)",
      bookmarks: user?.bookmarks || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { newsId } = await req.json();

    const user = await User.findByIdAndUpdate(
      auth.user.userId,
      { $pull: { bookmarks: newsId } },
      { new: true }
    ).select("bookmarks");

    return NextResponse.json({
      message: "बुकमार्क हटा दिया गया है (Removed from bookmarks)",
      bookmarks: user?.bookmarks || [],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

