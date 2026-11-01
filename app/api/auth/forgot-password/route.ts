import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "ईमेल आवश्यक है (Email is required)" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    // For security, don't reveal whether user exists
    if (!user) {
      return NextResponse.json({
        message: "यदि यह ईमेल पंजीकृत है, तो पासवर्ड रीसेट निर्देश भेज दिए गए हैं।",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `/reset-password?token=${resetToken}`;

    return NextResponse.json({
      message: "पासवर्ड रीसेट लिंक जनरेट हो गया है।",
      resetUrl, // Provided for user convenience and development
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

