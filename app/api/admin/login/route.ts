import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: "Your account has been deactivated. Contact a Super Admin." },
        { status: 403 }
      );
    }

    const allowedRoles = ["super_admin", "admin", "editor", "viewer"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { message: "Access denied. Insufficient permissions." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId ?? null,
      name: user.name ?? "",
    });

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name ?? "",
        role: user.role,
        tenantId: user.tenantId ?? null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Admin Login Error:", error);
    return NextResponse.json(
      { message: "Something went wrong", error: message },
      { status: 500 }
    );
  }
}
