import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PromotionBanner from "@/models/PromotionBanner";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const activeOnly = searchParams.get("activeOnly") === "true";

    const query: Record<string, unknown> = {};
    if (type) query.type = type;
    if (activeOnly) {
      query.isActive = true;
      const now = new Date();
      query.$and = [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ];
    }

    const banners = await PromotionBanner.find(query).sort({ priority: -1, createdAt: -1 }).lean();
    return NextResponse.json({ banners });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req, "promotions:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const body = await req.json();

    if (!body.name || !body.title || !body.ctaUrl) {
      return NextResponse.json(
        { message: "Name, title, and destination URL are required" },
        { status: 400 }
      );
    }

    const banner = await PromotionBanner.create({
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

