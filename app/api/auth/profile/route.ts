import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function PUT(req: Request) {
  try {
    const auth = authenticateRequest(req);
    if (!auth.authorized || !auth.user) {
      return auth.errorResponse || NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const allowedUpdates: Record<string, unknown> = {};

    if (typeof body.name === "string") allowedUpdates.name = body.name.trim();
    if (typeof body.phone === "string") allowedUpdates.phone = body.phone.trim();
    if (typeof body.avatar === "string") allowedUpdates.avatar = body.avatar.trim();
    if (typeof body.bio === "string") allowedUpdates.bio = body.bio.trim();

    if (body.preferences) {
      const prefs: Record<string, unknown> = {};
      if (body.preferences.language) prefs["preferences.language"] = body.preferences.language;
      if (typeof body.preferences.city === "string") prefs["preferences.city"] = body.preferences.city.trim();
      if (typeof body.preferences.state === "string") prefs["preferences.state"] = body.preferences.state.trim();
      if (Array.isArray(body.preferences.categories)) prefs["preferences.categories"] = body.preferences.categories;
      if (body.preferences.notificationTypes) prefs["preferences.notificationTypes"] = body.preferences.notificationTypes;
      if (body.preferences.dailyDigest) prefs["preferences.dailyDigest"] = body.preferences.dailyDigest;
      Object.assign(allowedUpdates, prefs);
    }

    const updatedUser = await User.findByIdAndUpdate(
      auth.user.userId,
      { $set: allowedUpdates },
      { new: true }
    )
      .select("-password -verificationToken -resetPasswordToken -resetPasswordExpires")
      .lean();

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई (Profile updated)",
      user: updatedUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

