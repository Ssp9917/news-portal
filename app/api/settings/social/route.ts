import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import GlobalSeo from "@/models/GlobalSeo";

export const dynamic = "force-dynamic";

const DEFAULT_SOCIAL_LINKS = {
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  instagram: "https://instagram.com",
  youtube: "https://youtube.com",
  telegram: "https://t.me",
  whatsapp: "",
  linkedin: "",
};

export async function GET() {
  try {
    await connectDB();
    const seo = await GlobalSeo.findOne().select("socialLinks").lean();
    const socialLinks = seo?.socialLinks || DEFAULT_SOCIAL_LINKS;

    return NextResponse.json({
      success: true,
      socialLinks: {
        ...DEFAULT_SOCIAL_LINKS,
        ...socialLinks,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      socialLinks: DEFAULT_SOCIAL_LINKS,
    });
  }
}

