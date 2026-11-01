import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import NotificationCampaign from "@/models/NotificationCampaign";
import DeviceToken from "@/models/DeviceToken";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function GET(req: Request) {
  try {
    const auth = authenticateRequest(req, "notifications:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();

    const [campaigns, totalSubscribers, mobileCount, desktopCount] = await Promise.all([
      NotificationCampaign.find().sort({ createdAt: -1 }).limit(50).lean(),
      DeviceToken.countDocuments({ isActive: true }),
      DeviceToken.countDocuments({ isActive: true, deviceType: "mobile" }),
      DeviceToken.countDocuments({ isActive: true, deviceType: "desktop" }),
    ]);

    return NextResponse.json({
      campaigns,
      stats: {
        totalSubscribers,
        mobileCount,
        desktopCount,
        tabletCount: Math.max(0, totalSubscribers - mobileCount - desktopCount),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req, "notifications:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const body = await req.json();

    if (!body.title || !body.message || !body.url) {
      return NextResponse.json(
        { message: "Title, message, and target URL are required" },
        { status: 400 }
      );
    }

    const campaign = await NotificationCampaign.create({
      name: body.name || body.title,
      title: body.title,
      message: body.message,
      image: body.image || "",
      url: body.url,
      category: body.category || "breaking",
      type: body.type || "breaking",
      priority: body.priority || "high",
      status: body.status || "draft",
      targetAudience: body.targetAudience || { segment: "all" },
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      createdBy: auth.user?.name || auth.user?.email || "Admin",
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = authenticateRequest(req, "notifications:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Campaign ID required" }, { status: 400 });
    }

    await NotificationCampaign.findByIdAndDelete(id);
    return NextResponse.json({ message: "Campaign deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

