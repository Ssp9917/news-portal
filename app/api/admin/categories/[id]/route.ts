import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = authenticateRequest(req, "category:manage");
    if (!auth.authorized) return auth.errorResponse!;

    const { id } = await params;
    await connectDB();
    const body = await req.json();

    const category = await Category.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
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
    const auth = authenticateRequest(req, "category:manage");
    if (!auth.authorized) return auth.errorResponse!;

    const { id } = await params;
    await connectDB();

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
