import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import News from "@/models/News";
import { verifyToken, getTokenFromHeader } from "@/lib/auth/jwt";

async function requireAdminAuth(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("Authorization"));
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  if (payload.role !== "admin" && payload.role !== "super_admin") return null;
  return payload;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const user = await User.findById(id)
      .select("-password -verificationToken -resetPasswordToken")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Optionally populate bookmark stories details
    let bookmarkedArticles: any[] = [];
    if (user.bookmarks && user.bookmarks.length > 0) {
      bookmarkedArticles = await News.find({
        $or: [
          { _id: { $in: user.bookmarks.filter((b) => b.length === 24) } },
          { slug: { $in: user.bookmarks } },
        ],
      })
        .select("title slug category date image views")
        .limit(20)
        .lean();
    }

    return NextResponse.json({
      user,
      bookmarkedArticles,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent non-super-admin from modifying super_admin users
    if (targetUser.role === "super_admin" && auth.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only super administrators can modify super_admin accounts" },
        { status: 403 }
      );
    }

    // Allowed updates
    if (typeof body.isActive === "boolean") {
      // Prevent self-deactivation
      if (auth.userId === id && !body.isActive) {
        return NextResponse.json(
          { error: "You cannot deactivate your own administrative account" },
          { status: 400 }
        );
      }
      targetUser.isActive = body.isActive;
    }

    if (body.role && ["user", "author", "editor", "admin", "super_admin"].includes(body.role)) {
      if (body.role === "super_admin" && auth.role !== "super_admin") {
        return NextResponse.json(
          { error: "Only super administrators can promote users to super_admin" },
          { status: 403 }
        );
      }
      targetUser.role = body.role;
    }

    if (typeof body.name === "string") {
      targetUser.name = body.name.trim();
    }

    if (typeof body.phone === "string") {
      targetUser.phone = body.phone.trim();
    }

    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isActive: targetUser.isActive,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error updating user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Safety checks
    if (auth.userId === id) {
      return NextResponse.json(
        { error: "You cannot delete your own administrative account" },
        { status: 400 }
      );
    }

    if (targetUser.role === "super_admin") {
      return NextResponse.json(
        { error: "Super administrator accounts cannot be deleted directly" },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error deleting user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
