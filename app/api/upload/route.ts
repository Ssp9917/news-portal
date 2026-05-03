// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) ?? "image"; // "image" | "video"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File → Buffer → base64 data URI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;
    const dataUri = `data:${mimeType};base64,${base64}`;

    const isVideo = type === "video" || mimeType.startsWith("video/");

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "news",
      resource_type: isVideo ? "video" : "image",
      // Auto-quality + format for images
      ...(isVideo
        ? { eager: [{ quality: "auto" }] }
        : { quality: "auto", fetch_format: "auto" }),
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Check Cloudinary credentials." },
      { status: 500 }
    );
  }
}

