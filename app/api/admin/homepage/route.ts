import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import HomepageConfig from "@/models/HomepageConfig";
import { authenticateRequest } from "@/lib/auth/require-auth";
import { ensureDefaultData } from "@/lib/init-defaults";

export async function GET() {
  try {
    await connectDB();
    await ensureDefaultData();
    let config = await HomepageConfig.findOne().sort({ updatedAt: -1 });
    if (!config) {
      config = await HomepageConfig.create({ isPublished: true, sections: [] });
    }
    return NextResponse.json(config);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req, "homepage:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const data = await req.json();

    let config = await HomepageConfig.findOne().sort({ updatedAt: -1 });
    if (config) {
      if (Array.isArray(data.sections)) {
        config.sections = data.sections;
      }
      if (typeof data.isPublished === "boolean") {
        config.isPublished = data.isPublished;
      }
      await config.save();
    } else {
      config = await HomepageConfig.create(data);
    }

    return NextResponse.json({
      message: "Homepage layout updated successfully",
      config,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
