import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Newsletter from "@/models/Newsletter";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Newsletter.findOne({ email: cleanEmail });

    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      return NextResponse.json({
        message: "You are already subscribed to our Daily Briefing!",
      });
    }

    await Newsletter.create({ email: cleanEmail });

    return NextResponse.json(
      { message: "Successfully subscribed! Welcome to the Daily Briefing." },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const auth = authenticateRequest(req, "dashboard:view");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 }).limit(200);
    const count = await Newsletter.countDocuments({ isActive: true });

    return NextResponse.json({ total: count, subscribers });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
