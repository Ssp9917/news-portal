import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { authenticateRequest } from "@/lib/auth/require-auth";
import { ensureDefaultData } from "@/lib/init-defaults";

export async function GET() {
  try {
    await connectDB();
    await ensureDefaultData();
    const categories = await Category.find().sort({ order: 1, createdAt: 1 });
    return NextResponse.json(categories);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req, "category:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const body = await req.json();

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { message: "Name and slug are required" },
        { status: 400 }
      );
    }

    const cleanSlug = body.slug.trim().toLowerCase().replace(/\s+/g, "-");
    const existing = await Category.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { message: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = await Category.create({
      ...body,
      slug: cleanSlug,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
