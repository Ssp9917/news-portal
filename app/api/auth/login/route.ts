import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "ईमेल और पासवर्ड दोनों आवश्यक हैं (Email and password required)" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "ईमेल या पासवर्ड गलत है (Invalid email or password)" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: "यह खाता निष्क्रिय कर दिया गया है (Account is deactivated)" },
        { status: 403 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { message: "ईमेल या पासवर्ड गलत है (Invalid email or password)" },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: String(user._id),
      email: user.email,
      role: user.role as any,
      tenantId: user.tenantId,
      name: user.name,
    });

    const isStaff = ["super_admin", "admin", "editor", "author", "seo_manager", "media_manager"].includes(user.role);

    const response = NextResponse.json({
      message: "सफलतापूर्वक लॉगिन किया गया (Login successful)",
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        preferences: user.preferences,
        bookmarks: user.bookmarks,
        isStaff,
      },
      token,
    });

    // Set auth cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    // If staff, also set admin_token for legacy admin panel compatibility
    if (isStaff) {
      response.cookies.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    console.error("Login error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

