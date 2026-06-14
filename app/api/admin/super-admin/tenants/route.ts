import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Tenant } from "@/models/Tenant";
import { verifyToken, getTokenFromHeader } from "@/lib/auth/jwt";

// GET /api/admin/super-admin/tenants
export async function GET(req: Request) {
  try {
    const payload = verifyToken(getTokenFromHeader(req.headers.get("Authorization")) ?? "");
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const tenants = await Tenant.find({}).sort({ createdAt: -1 });
    return NextResponse.json(tenants);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/admin/super-admin/tenants — create a tenant
export async function POST(req: Request) {
  try {
    const payload = verifyToken(getTokenFromHeader(req.headers.get("Authorization")) ?? "");
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { name, slug, plan, settings } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ message: "Name and slug are required" }, { status: 400 });
    }

    const exists = await Tenant.findOne({ slug: slug.toLowerCase() });
    if (exists) {
      return NextResponse.json({ message: "Slug already in use" }, { status: 409 });
    }

    const tenant = await Tenant.create({
      name,
      slug: slug.toLowerCase(),
      plan: plan ?? "free",
      ownerId: payload.userId,
      settings: settings ?? {},
      isActive: true,
    });

    return NextResponse.json({ message: "Tenant created", tenant }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

// PATCH /api/admin/super-admin/tenants?id=xxx — update tenant
export async function PATCH(req: Request) {
  try {
    const payload = verifyToken(getTokenFromHeader(req.headers.get("Authorization")) ?? "");
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await connectDB();
    const body = await req.json();
    const updated = await Tenant.findByIdAndUpdate(id, body, { new: true });

    if (!updated) return NextResponse.json({ message: "Tenant not found" }, { status: 404 });
    return NextResponse.json({ message: "Updated", tenant: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
