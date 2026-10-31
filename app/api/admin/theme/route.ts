import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ThemeConfig from "@/models/ThemeConfig";
import { authenticateRequest } from "@/lib/auth/require-auth";
import { ensureDefaultData } from "@/lib/init-defaults";

export async function GET() {
  try {
    await connectDB();
    await ensureDefaultData();
    let theme = await ThemeConfig.findOne().sort({ updatedAt: -1 });
    if (!theme) {
      theme = await ThemeConfig.create({});
    }
    return NextResponse.json(theme);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req, "theme:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const data = await req.json();

    let theme = await ThemeConfig.findOne().sort({ updatedAt: -1 });
    if (theme) {
      Object.assign(theme, data);
      await theme.save();
    } else {
      theme = await ThemeConfig.create(data);
    }

    return NextResponse.json({ message: "Theme updated successfully", theme });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
