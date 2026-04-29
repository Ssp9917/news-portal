
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import News from "@/models/News";

export const dynamic = "force-static";

export async function generateStaticParams() {
  try {
    await connectDB();
    const news = await News.find({}, "_id");
    return news.map((item) => ({
      id: item._id.toString(),
    }));
  } catch (e) {
    console.error("Failed to generate static params for API:", e);
    return [];
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

    // Set expiration if breaking, or reset if not
    if (body.isBreaking) {
        body.breakingExpiresAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); 
    } else {
        body.breakingExpiresAt = null;
    }

    const updatedNews = await News.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedNews) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json(updatedNews);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
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

    const deletedNews = await News.findByIdAndDelete(id);

    if (!deletedNews) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "News deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await props.params;
    const { id } = resolvedParams;
    
    // Mongoose findById
    const news = await News.findById(id);

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


