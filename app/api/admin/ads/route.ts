import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Advertisement from "@/models/Advertisement";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";
    const slot = searchParams.get("slot");

    const query: Record<string, unknown> = {};
    if (activeOnly) query.isActive = true;
    if (slot) query.slot = slot;

    const ads = await Advertisement.find(query).sort({ createdAt: -1 });
    return NextResponse.json(ads);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req, "ads:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const body = await req.json();

    if (!body.title || !body.slot || !body.adType) {
      return NextResponse.json(
        { message: "Title, slot, and ad type are required" },
        { status: 400 }
      );
    }

    const ad = await Advertisement.create(body);
    return NextResponse.json(ad, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
