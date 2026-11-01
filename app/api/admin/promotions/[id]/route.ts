import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import PromotionBanner from "@/models/PromotionBanner";
import { authenticateRequest } from "@/lib/auth/require-auth";

type Props = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Props) {
  try {
    const auth = authenticateRequest(req, "promotions:manage");
    if (!auth.authorized) return auth.errorResponse!;

    const { id } = await params;
    await connectDB();
    const body = await req.json();

    const banner = await PromotionBanner.findByIdAndUpdate(
      id,
      {
        $set: {
          ...body,
          startDate: body.startDate ? new Date(body.startDate) : null,
          endDate: body.endDate ? new Date(body.endDate) : null,
        },
      },
      { new: true }
    );

    return NextResponse.json(banner);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Props) {
  try {
    const auth = authenticateRequest(req, "promotions:manage");
    if (!auth.authorized) return auth.errorResponse!;

    const { id } = await params;
    await connectDB();
    await PromotionBanner.findByIdAndDelete(id);

    return NextResponse.json({ message: "Promotion banner deleted" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

