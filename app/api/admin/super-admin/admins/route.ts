import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { verifyToken, getTokenFromHeader, signToken } from "@/lib/auth/jwt";
import bcrypt from "bcryptjs";

// GET /api/admin/super-admin/admins — list all admins (super_admin only)
export async function GET(req: Request) {
  try {
    const payload = verifyToken(getTokenFromHeader(req.headers.get("Authorization")) ?? "");
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const admins = await User.find(
      { role: { $ne: "super_admin" } },
      { password: 0 }
    ).sort({ createdAt: -1 });

    return NextResponse.json(admins);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/admin/super-admin/admins — create new admin (super_admin only)
export async function POST(req: Request) {
  try {
    const payload = verifyToken(getTokenFromHeader(req.headers.get("Authorization")) ?? "");
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { email, name, password, role, tenantId } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const allowedRoles = ["admin", "editor", "viewer"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email: email.toLowerCase(),
      name: name ?? "",
      password: hashed,
      role: role ?? "admin",
      tenantId: tenantId ?? null,
      isActive: true,
      createdBy: payload.userId,
    });

    // Return the new admin token for reference (optional)
    const token = signToken({
      userId: String(newUser._id),
      email: newUser.email,
      role: newUser.role,
      tenantId: newUser.tenantId,
      name: newUser.name,
    });

    return NextResponse.json(
      {
        message: "Admin created successfully",
        user: {
          id: String(newUser._id),
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          tenantId: newUser.tenantId,
          isActive: newUser.isActive,
        },
        token,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
