import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Poll from "@/models/Poll";
import { authenticateRequest } from "@/lib/auth/require-auth";

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const query: Record<string, unknown> = { isActive: true };
    if (category) query.category = category;

    // Get the most recent active poll
    let poll = await Poll.findOne(query).sort({ createdAt: -1 });

    // Seed a default high-engagement poll if none exists
    if (!poll) {
      poll = await Poll.create({
        question: "क्या भारत को डिजिटल अर्थव्यवस्था और AI तकनीक में विश्व का नेतृत्व करना चाहिए?",
        category: "राष्ट्रीय",
        options: [
          { id: "opt-1", text: "हाँ, पूरी तरह सहमत (Strongly Agree)", votes: 342 },
          { id: "opt-2", text: "हाँ, लेकिन सुरक्षा नियमों के साथ (With Regulations)", votes: 198 },
          { id: "opt-3", text: "नहीं, पहले बुनियादी ढांचा सुधारा जाए", votes: 45 },
          { id: "opt-4", text: "कह नहीं सकते (Can't Say)", votes: 12 },
        ],
        totalVotes: 597,
        isActive: true,
      });
    }

    return NextResponse.json(poll);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const { pollId, optionId, voterToken } = await req.json();

    if (!pollId || !optionId) {
      return NextResponse.json({ message: "Poll ID and Option ID are required" }, { status: 400 });
    }

    const auth = authenticateRequest(req);
    const voterId = (auth.authorized && auth.user?.userId) || voterToken || "anon_" + Date.now();

    const poll = await Poll.findById(pollId);
    if (!poll || !poll.isActive) {
      return NextResponse.json({ message: "Poll not found or closed" }, { status: 404 });
    }

    // Check if voter already voted
    if (voterId && poll.voterIdentifiers.includes(voterId)) {
      return NextResponse.json(
        { message: "आप इस पोल में पहले ही वोट दे चुके हैं (Already voted)", poll },
        { status: 409 }
      );
    }

    // Increment option vote
    const opt = poll.options.find((o) => o.id === optionId);
    if (!opt) {
      return NextResponse.json({ message: "Invalid option" }, { status: 400 });
    }

    opt.votes += 1;
    poll.totalVotes += 1;
    if (voterId) poll.voterIdentifiers.push(voterId);

    await poll.save();

    return NextResponse.json({
      message: "आपका वोट सफलतापूर्वक दर्ज हो गया! (Vote registered)",
      poll,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ message }, { status: 500 });
  }
}

