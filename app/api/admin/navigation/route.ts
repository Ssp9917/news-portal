import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import NavigationConfig from "@/models/NavigationConfig";
import { authenticateRequest } from "@/lib/auth/require-auth";
import { ensureDefaultData } from "@/lib/init-defaults";

export async function GET() {
  try {
    await connectDB();
    await ensureDefaultData();
    let nav = await NavigationConfig.findOne().sort({ updatedAt: -1 });
    if (!nav) {
      nav = await NavigationConfig.create({ headerLinks: [], footerGroups: [] });
    }
    return NextResponse.json(nav);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req, "navigation:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const data = await req.json();

    let nav = await NavigationConfig.findOne().sort({ updatedAt: -1 });
    if (nav) {
      if (Array.isArray(data.headerLinks)) nav.headerLinks = data.headerLinks;
      if (Array.isArray(data.footerGroups)) nav.footerGroups = data.footerGroups;
      await nav.save();
    } else {
      nav = (await NavigationConfig.create(data)) as any;
    }

    return NextResponse.json({
      message: "Navigation configuration updated successfully",
      nav,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
