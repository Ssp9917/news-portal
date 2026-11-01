import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DeviceToken from "@/models/DeviceToken";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.token) {
      return NextResponse.json({ message: "Device token is required" }, { status: 400 });
    }

    // Optional user authentication link
    const auth = authenticateRequest(req);
    const userId = auth.authorized && auth.user ? auth.user.userId : null;

    const tokenDoc = await DeviceToken.findOneAndUpdate(
      { token: body.token },
      {
        $set: {
          token: body.token,
          userId,
          deviceType: body.deviceType || "desktop",
          browser: body.browser || "",
          platform: body.platform || "",
          city: body.city || "",
          state: body.state || "",
          language: body.language || "hi",
          isActive: true,
          lastActiveAt: new Date(),
        },
        $setOnInsert: {
          subscribedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: "सफलतापूर्वक नोटिफिकेशन सब्सक्राइब किया गया! (Subscribed to notifications)",
      subscriptionId: tokenDoc._id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    console.error("Notification subscribe error:", error);
    return NextResponse.json({ message }, { status: 500 });
  }
}

