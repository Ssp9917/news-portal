import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PromotionBanner from "@/models/PromotionBanner";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { bannerId, event } = await req.json(); // event: "impression" | "click"

    if (!bannerId || !event) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const incField = event === "click" ? "stats.clicks" : "stats.impressions";

    await PromotionBanner.findByIdAndUpdate(bannerId, {
      $inc: { [incField]: 1 },
    });

    return NextResponse.json({ tracked: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

