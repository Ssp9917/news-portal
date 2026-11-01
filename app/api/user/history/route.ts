import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function GET(req: Request) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ history: [] }, { status: 200 });
    }

    await connectDB();
    const user = await User.findById(auth.user.userId).select("readingHistory").lean();
    const history = (user?.readingHistory || []).reverse().slice(0, 50);

    return NextResponse.json({ history });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authorized || !auth.user) {
      // For anonymous users, client stores in localStorage
      return NextResponse.json({ recorded: false, reason: "anonymous" });
    }

    await connectDB();
    const { newsId, title, slug, category, image } = await req.json();

    if (!newsId || !slug) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const item = {
      newsId,
      title: title || "Untitled Article",
      slug,
      category: category || "सामान्य",
      image: image || "",
      viewedAt: new Date(),
    };

    // Remove existing item if present, then push to top
    await User.findByIdAndUpdate(auth.user.userId, {
      $pull: { readingHistory: { slug } },
    });

    await User.findByIdAndUpdate(auth.user.userId, {
      $push: {
        readingHistory: {
          $each: [item],
          $slice: -50, // Keep last 50
        },
      },
    });

    return NextResponse.json({ recorded: true });
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
    await User.findByIdAndUpdate(auth.user.userId, {
      $set: { readingHistory: [] },
    });

    return NextResponse.json({ message: "Reading history cleared" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

