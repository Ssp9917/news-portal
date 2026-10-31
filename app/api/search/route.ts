import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import News from "@/models/News";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim();
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!q && !category) {
      return NextResponse.json({ results: [] });
    }

    const filter: Record<string, unknown> = { published: true };

    if (category) {
      filter.category = category;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { excerpt: { $regex: q, $options: "i" } },
        { "titleI18n.hi": { $regex: q, $options: "i" } },
        { "titleI18n.en": { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ];
    }

    const results = await News.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("title slug category excerpt image date views createdAt");

    return NextResponse.json({ results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
