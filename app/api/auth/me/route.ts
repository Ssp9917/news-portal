import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function GET(req: Request) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    await connectDB();
    const user = await User.findById(auth.user.userId)
      .select("-password -verificationToken -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!user || !user.isActive) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const isStaff = [
      "super_admin",
      "admin",
      "editor",
      "author",
      "seo_manager",
      "media_manager",
    ].includes(user.role);

    return NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        preferences: user.preferences,
        bookmarks: user.bookmarks || [],
        readingHistoryCount: user.readingHistory ? user.readingHistory.length : 0,
        isStaff,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

