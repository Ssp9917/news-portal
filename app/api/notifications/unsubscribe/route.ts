import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DeviceToken from "@/models/DeviceToken";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token } = await req.json();

    if (token) {
      await DeviceToken.findOneAndUpdate(
        { token },
        { $set: { isActive: false } }
      );
    }

    return NextResponse.json({
      message: "सफलतापूर्वक अनसब्सक्राइब किया गया (Unsubscribed)",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

