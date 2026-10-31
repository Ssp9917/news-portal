import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Media from "@/models/Media";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req, "media:manage");
    if (!auth.authorized) return auth.errorResponse!;

    const { id } = await params;
    await connectDB();

    const deleted = await Media.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Media deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
