import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password, language, city, state } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "कृपया एक वैध ईमेल पता दर्ज करें (Valid email required)" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए (Password min 6 chars)" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      return NextResponse.json(
        { message: "यह ईमेल पहले से पंजीकृत है (Account already exists)" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name?.trim() || cleanEmail.split("@")[0],
      email: cleanEmail,
      password: hashedPassword,
      role: "user",
      isActive: true,
      isEmailVerified: false,
      preferences: {
        language: language || "hi",
        city: city || "",
        state: state || "",
        categories: ["national", "politics", "sports", "business", "technology"],
        notificationTypes: {
          breaking: true,
          local: true,
          digest: true,
          marketing: false,
        },
        dailyDigest: "morning",
      },
      bookmarks: [],
      readingHistory: [],
    });

    const token = signToken({
      userId: String(newUser._id),
      email: newUser.email,
      role: newUser.role as any,
      name: newUser.name,
    });

    const response = NextResponse.json(
      {
        message: "खाता सफलतापूर्वक बन गया! (Account created successfully)",
        user: {
          id: String(newUser._id),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          preferences: newUser.preferences,
          bookmarks: newUser.bookmarks,
        },
        token,
      },
      { status: 201 }
    );

    // Set HTTP-Only Cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    console.error("Register error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

