import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs/promises";
async function getSharp() {
  try {
    // @ts-expect-error sharp is an optional native dependency
    const s = await import("sharp");
    return s.default || s;
  } catch {
    return null;
  }
}

// Configure Cloudinary if environment variables are present
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

function cleanFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);
}

function generateSeoAlt(originalName: string, customAlt?: string | null): string {
  if (customAlt && customAlt.trim()) {
    return customAlt.trim();
  }
  const clean = originalName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  return `${clean} | भारत पल्स (Bharat Pulse News)`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) ?? "image";
    const customAlt = formData.get("altText") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "";
    const isVideo = type === "video" || mimeType.startsWith("video/");
    const baseCleanName = cleanFilename(file.name || "upload");
    const timestamp = Date.now();

    // ── 1. IMAGE PROCESSING: Always Convert & Save in WebP ──
    if (!isVideo) {
      const sharp = await getSharp();
      let webpBuffer = buffer;
      let imgWidth = 1200;
      let imgHeight = 800;

      if (sharp) {
        try {
          webpBuffer = await sharp(buffer)
            .rotate() // auto-orient based on EXIF
            .webp({ quality: 82, effort: 4 })
            .toBuffer();
          const imageMeta = await sharp(webpBuffer).metadata();
          imgWidth = imageMeta.width || 1200;
          imgHeight = imageMeta.height || 800;
        } catch {
          webpBuffer = buffer;
        }
      }

      const seoAlt = generateSeoAlt(file.name, customAlt);
      const webpFilename = `${baseCleanName}-${timestamp}.webp`;

      // Attempt Cloudinary upload if configured
      if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      ) {
        try {
          const base64 = webpBuffer.toString("base64");
          const dataUri = `data:image/webp;base64,${base64}`;

          const cloudResult = await cloudinary.uploader.upload(dataUri, {
            folder: "news/webp",
            format: "webp",
            resource_type: "image",
          });

          return NextResponse.json({
            url: cloudResult.secure_url,
            publicId: cloudResult.public_id,
            width: cloudResult.width || imgWidth,
            height: cloudResult.height || imgHeight,
            format: "webp",
            resourceType: "image",
            altText: seoAlt,
            sizeBytes: webpBuffer.length,
          });
        } catch (cloudErr) {
          console.warn("Cloudinary upload failed, falling back to local WebP storage:", cloudErr);
        }
      }

      // Local WebP storage fallback
      const uploadDir = path.join(process.cwd(), "public", "uploads", "images");
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, webpFilename);
      await fs.writeFile(filePath, webpBuffer);

      return NextResponse.json({
        url: `/uploads/images/${webpFilename}`,
        width: imgWidth,
        height: imgHeight,
        format: "webp",
        resourceType: "image",
        altText: seoAlt,
        sizeBytes: webpBuffer.length,
        savedLocally: true,
      });
    }

    // ── 2. VIDEO PROCESSING & COMPRESSION ──
    // Limit max video size (e.g., 50MB for raw uploads)
    if (buffer.length > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Video file exceeds 50MB limit. Please compress before uploading." },
        { status: 400 }
      );
    }

    const videoExt = path.extname(file.name) || ".mp4";
    const videoFilename = `vid-${baseCleanName}-${timestamp}${videoExt}`;

    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const base64 = buffer.toString("base64");
        const dataUri = `data:${mimeType};base64,${base64}`;

        const cloudResult = await cloudinary.uploader.upload(dataUri, {
          folder: "news/videos",
          resource_type: "video",
          eager: [
            { quality: "auto", video_codec: "auto", bit_rate: "800k" },
          ],
        });

        return NextResponse.json({
          url: cloudResult.secure_url,
          publicId: cloudResult.public_id,
          format: cloudResult.format,
          resourceType: "video",
          width: cloudResult.width,
          height: cloudResult.height,
          duration: cloudResult.duration,
          altText: generateSeoAlt(file.name, customAlt),
        });
      } catch (cloudErr) {
        console.warn("Cloudinary video upload failed, saving locally:", cloudErr);
      }
    }

    // Local Video Storage Fallback
    const videoDir = path.join(process.cwd(), "public", "uploads", "videos");
    await fs.mkdir(videoDir, { recursive: true });
    const videoFilePath = path.join(videoDir, videoFilename);
    await fs.writeFile(videoFilePath, buffer);

    return NextResponse.json({
      url: `/uploads/videos/${videoFilename}`,
      format: videoExt.replace(".", ""),
      resourceType: "video",
      altText: generateSeoAlt(file.name, customAlt),
      savedLocally: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload error";
    console.error("Upload error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
