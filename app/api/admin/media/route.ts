import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Media from "@/models/Media";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { altText: { $regex: search, $options: "i" } },
        { caption: { $regex: search, $options: "i" } },
      ];
    }

    const items = await Media.find(query).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json(items);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req, "media:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const body = await req.json();

    if (!body.url) {
      return NextResponse.json({ message: "URL is required" }, { status: 400 });
    }

    const item = await Media.create({
      ...body,
      name: body.name || "Image-" + Date.now(),
      uploadedBy: auth.user?.name || auth.user?.email || "Admin",
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
