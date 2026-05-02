import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import News from "@/models/News";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const category = searchParams.get("category");

    let filter: any = {};

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { "titleI18n.en": { $regex: query, $options: "i" } },
        { "titleI18n.hi": { $regex: query, $options: "i" } },
        { "titleI18n.bn": { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
        { "contentI18n.en": { $regex: query, $options: "i" } },
        { "contentI18n.hi": { $regex: query, $options: "i" } },
        { "contentI18n.bn": { $regex: query, $options: "i" } },
        { excerpt: { $regex: query, $options: "i" } },
        { "excerptI18n.en": { $regex: query, $options: "i" } },
        { "excerptI18n.hi": { $regex: query, $options: "i" } },
        { "excerptI18n.bn": { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "0"); // 0 means no limit

    const skip = (page - 1) * limit;

    let queryBuilder = News.find(filter).sort({ createdAt: -1 });
    
    if (limit > 0) {
      queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    const news = await queryBuilder;

    // Check for expired breaking news
    const now = new Date();
    const processedNews = news.map(item => {
      // If it's breaking but expired, we treat it as not breaking for display
      // Ideally we would update the DB, but "read-time" correction is faster/safer for now
      if (item.isBreaking && item.breakingExpiresAt && new Date(item.breakingExpiresAt) < now) {
         // Create a shallow copy to avoid mutating the original mongoose doc if it's strict
         const plainItem = item.toObject ? item.toObject() : { ...item };
         plainItem.isBreaking = false;
         return plainItem;
      }
      return item;
    });

    return NextResponse.json(processedNews);
  } catch (error: any) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Set expiration if breaking
    if (body.isBreaking) {
        body.breakingExpiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 48 hours
    }

    const news = await News.create(body);
    return NextResponse.json(news, { status: 201 });
  } catch (error: any) {
    console.error("Error creating news:", error);
    return NextResponse.json(
      { error: error?.message || "Error creating news" },
      { status: 500 }
    );
  }
}
