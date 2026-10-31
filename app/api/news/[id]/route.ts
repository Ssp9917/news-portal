import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import News from "@/models/News";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await props.params;
    const { id } = resolvedParams;

    let news = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      news = await News.findById(id);
    }
    if (!news) {
      news = await News.findOne({ slug: id });
    }

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await props.params;
    const { id } = resolvedParams;
    const body = await request.json();

    if (body.isBreaking) {
      body.breakingExpiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    } else {
      body.breakingExpiresAt = null;
    }

    // Auto calculate reading time if content changed
    if (body.content) {
      const words = body.content.replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
      body.readingTime = Math.max(1, Math.ceil(words / 180));
    }

    let updatedNews = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updatedNews = await News.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });
    } else {
      updatedNews = await News.findOneAndUpdate({ slug: id }, body, {
        new: true,
        runValidators: true,
      });
    }

    if (!updatedNews) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json(updatedNews);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await props.params;
    const { id } = resolvedParams;

    let deletedNews = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deletedNews = await News.findByIdAndDelete(id);
    } else {
      deletedNews = await News.findOneAndDelete({ slug: id });
    }

    if (!deletedNews) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "News deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
