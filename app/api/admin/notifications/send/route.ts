import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import NotificationCampaign from "@/models/NotificationCampaign";
import { sendNotificationToAudience } from "@/lib/firebase/admin";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req, "notifications:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const { campaignId } = await req.json();

    if (!campaignId) {
      return NextResponse.json({ message: "Campaign ID required" }, { status: 400 });
    }

    const campaign = await NotificationCampaign.findById(campaignId);
    if (!campaign) {
      return NextResponse.json({ message: "Campaign not found" }, { status: 404 });
    }

    // Set sending status
    campaign.status = "sending";
    await campaign.save();

    const result = await sendNotificationToAudience(
      campaignId,
      {
        title: campaign.title,
        body: campaign.message,
        url: campaign.url,
        image: campaign.image,
        category: campaign.category,
        type: campaign.type,
      },
      campaign.targetAudience as any
    );

    return NextResponse.json({
      message: `सूचना सफलतापूर्वक प्रसारित की गई! लक्षित: ${result.totalTargeted}, भेजे गए: ${result.sentCount}`,
      stats: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    console.error("Campaign send error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

