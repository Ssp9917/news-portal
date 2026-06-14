import { NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  try {
    const token = getTokenFromHeader(req.headers.get("Authorization"));
    if (!token) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: payload.userId,
        email: payload.email,
        name: payload.name ?? "",
        role: payload.role,
        tenantId: payload.tenantId ?? null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message, }, { status: 500 });
  }
}
