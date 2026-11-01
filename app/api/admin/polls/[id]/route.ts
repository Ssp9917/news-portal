import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Poll from "@/models/Poll";
import { authenticateRequest } from "@/lib/auth/require-auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

// PATCH /api/admin/polls/[id] - Update poll (toggle active, reset votes, update text)
export async function PATCH(req: Request, { params }: Props) {
  try {
    const auth = authenticateRequest(req, "polls:manage");
    if (!auth.authorized) return auth.errorResponse!;

    const { id } = await params;
    await connectDB();

    const body = await req.json();
    const poll = await Poll.findById(id);

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    // Action 1: Toggle active state
    if (typeof body.isActive === "boolean") {
      if (body.isActive) {
        // Deactivate other polls so this is the featured live poll
        await Poll.updateMany({ _id: { $ne: id }, isActive: true }, { $set: { isActive: false } });
      }
      poll.isActive = body.isActive;
    }

    // Action 2: Reset votes
    if (body.resetVotes === true) {
      poll.totalVotes = 0;
      poll.voterIdentifiers = [];
      poll.options.forEach((opt) => {
        opt.votes = 0;
      });
    }

    // Action 3: Update details if provided
    if (body.question && typeof body.question === "string") {
      poll.question = body.question.trim();
    }
    if (body.category && typeof body.category === "string") {
      poll.category = body.category.trim();
    }
    if (body.expiresAt !== undefined) {
      poll.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }

    await poll.save();

    return NextResponse.json({
      success: true,
      message: "Poll updated successfully",
      poll,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/polls/[id] - Remove poll
export async function DELETE(req: Request, { params }: Props) {
  try {
    const auth = authenticateRequest(req, "polls:manage");
    if (!auth.authorized) return auth.errorResponse!;

    const { id } = await params;
    await connectDB();

    const deleted = await Poll.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Poll deleted successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

