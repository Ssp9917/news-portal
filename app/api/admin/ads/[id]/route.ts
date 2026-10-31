import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Advertisement from "@/models/Advertisement";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req, "ads:manage");
    if (!auth.authorized) return auth.errorResponse!;

    const { id } = await params;
    await connectDB();
    const body = await req.json();

    const ad = await Advertisement.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!ad) {
      return NextResponse.json(
        { message: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ad);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req, "ads:manage");
    if (!auth.authorized) return auth.errorResponse!;

    const { id } = await params;
    await connectDB();

    const deleted = await Advertisement.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { message: "Advertisement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Advertisement deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
