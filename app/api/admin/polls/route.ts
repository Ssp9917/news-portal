import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Poll from "@/models/Poll";
import { authenticateRequest } from "@/lib/auth/require-auth";

export const dynamic = "force-dynamic";

// GET /api/admin/polls - List all polls with engagement stats
export async function GET(req: Request) {
  try {
    const auth = authenticateRequest(req, "polls:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const polls = await Poll.find().sort({ createdAt: -1 }).lean();

    const totalVotesAll = polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0);
    const activeCount = polls.filter((p) => p.isActive).length;

    return NextResponse.json({
      success: true,
      polls,
      stats: {
        totalPolls: polls.length,
        activePolls: activeCount,
        totalVotes: totalVotesAll,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/polls - Create a new poll
export async function POST(req: Request) {
  try {
    const auth = authenticateRequest(req, "polls:manage");
    if (!auth.authorized) return auth.errorResponse!;

    await connectDB();
    const body = await req.json();

    const { question, category = "राष्ट्रीय", options, isActive = true, expiresAt } = body;

    if (!question || typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return NextResponse.json(
        { error: "At least 2 options are required for a poll." },
        { status: 400 }
      );
    }

    // Format options with unique ids
    const formattedOptions = options.map((opt: string | { id?: string; text: string; votes?: number }, index: number) => {
      const text = typeof opt === "string" ? opt.trim() : (opt.text || "").trim();
      const votes = typeof opt === "object" && typeof opt.votes === "number" ? opt.votes : 0;
      return {
        id: typeof opt === "object" && opt.id ? opt.id : `opt-${index + 1}-${Date.now()}`,
        text,
        votes,
      };
    }).filter((opt: { text: string }) => opt.text.length > 0);

    if (formattedOptions.length < 2) {
      return NextResponse.json(
        { error: "Please enter at least 2 non-empty options." },
        { status: 400 }
      );
    }

    // If activating this poll, deactivate any previous active polls to avoid ambiguity
    if (isActive) {
      await Poll.updateMany({ isActive: true }, { $set: { isActive: false } });
    }

    const totalVotes = formattedOptions.reduce((acc: number, curr: { votes: number }) => acc + curr.votes, 0);

    const newPoll = await Poll.create({
      question: question.trim(),
      category: category.trim(),
      options: formattedOptions,
      totalVotes,
      voterIdentifiers: [],
      isActive: Boolean(isActive),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    return NextResponse.json({
      success: true,
      message: "Poll created successfully!",
      poll: newPoll,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

