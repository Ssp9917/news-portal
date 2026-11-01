import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken, getTokenFromHeader } from "@/lib/auth/jwt";

async function requireAdminAuth(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("Authorization"));
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  if (payload.role !== "admin" && payload.role !== "super_admin") return null;
  return payload;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdminAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const q = (searchParams.get("q") || "").trim();
    const role = searchParams.get("role") || "all";
    const status = searchParams.get("status") || "all";
    const language = searchParams.get("language") || "all";
    const city = (searchParams.get("city") || "").trim();
    const isExport = searchParams.get("export") === "csv";

    // Build filter query
    const filter: Record<string, any> = {};

    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { "preferences.city": regex },
      ];
    }

    if (role && role !== "all") {
      filter.role = role;
    }

    if (status === "active") {
      filter.isActive = { $ne: false };
    } else if (status === "banned" || status === "inactive") {
      filter.isActive = false;
    }

    if (language && language !== "all") {
      filter["preferences.language"] = language;
    }

    if (city) {
      filter["preferences.city"] = new RegExp(`^${city}$`, "i");
    }

    // Export CSV handling
    if (isExport) {
      const allMatchingUsers = await User.find(filter)
        .sort({ createdAt: -1 })
        .select("-password -verificationToken -resetPasswordToken")
        .lean();

      let csv = "ID,Name,Email,Role,Status,Verified,Phone,City,State,Language,BookmarksCount,HistoryCount,CreatedAt\n";
      for (const u of allMatchingUsers as any[]) {
        const id = u._id?.toString() || "";
        const name = (u.name || "").replace(/"/g, '""');
        const email = u.email || "";
        const uRole = u.role || "user";
        const uStatus = u.isActive !== false ? "Active" : "Banned";
        const verified = u.isEmailVerified ? "Yes" : "No";
        const phone = u.phone || "";
        const uCity = (u.preferences?.city || "").replace(/"/g, '""');
        const state = (u.preferences?.state || "").replace(/"/g, '""');
        const lang = u.preferences?.language || "hi";
        const bookmarksCount = u.bookmarks?.length || 0;
        const historyCount = u.readingHistory?.length || 0;
        const createdAt = u.createdAt ? new Date(u.createdAt).toISOString() : "";

        csv += `"${id}","${name}","${email}","${uRole}","${uStatus}","${verified}","${phone}","${uCity}","${state}","${lang}",${bookmarksCount},${historyCount},"${createdAt}"\n`;
      }

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="bharat_pulse_users_${Date.now()}.csv"`,
        },
      });
    }

    // Pagination query
    const skip = (page - 1) * limit;

    const [users, totalCount, statsAgg] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-password -verificationToken -resetPasswordToken")
        .lean(),
      User.countDocuments(filter),
      // Aggregation for top-level KPIs
      User.aggregate([
        {
          $facet: {
            total: [{ $count: "count" }],
            active: [{ $match: { isActive: { $ne: false } } }, { $count: "count" }],
            verified: [{ $match: { isEmailVerified: true } }, { $count: "count" }],
            banned: [{ $match: { isActive: false } }, { $count: "count" }],
            topCities: [
              { $match: { "preferences.city": { $exists: true, $ne: "" } } },
              { $group: { _id: "$preferences.city", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 6 },
            ],
            languageBreakdown: [
              { $match: { "preferences.language": { $exists: true, $ne: "" } } },
              { $group: { _id: "$preferences.language", count: { $sum: 1 } } },
            ],
          },
        },
      ]),
    ]);

    const facet = statsAgg[0] || {};
    const stats = {
      totalUsers: facet.total?.[0]?.count || 0,
      activeUsers: facet.active?.[0]?.count || 0,
      verifiedUsers: facet.verified?.[0]?.count || 0,
      bannedUsers: facet.banned?.[0]?.count || 0,
      topCities: facet.topCities || [],
      languageBreakdown: facet.languageBreakdown || [],
    };

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
      stats,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error fetching users";
    console.error("Admin Users GET Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
