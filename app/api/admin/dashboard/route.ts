import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import News from "@/models/News";
import User from "@/models/User";
import Category from "@/models/Category";
import DeviceToken from "@/models/DeviceToken";
import Comment from "@/models/Comment";
import Poll from "@/models/Poll";
import GlobalSeo from "@/models/GlobalSeo";
import { verifyToken, getTokenFromHeader } from "@/lib/auth/jwt";

async function requireStaffAuth(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("Authorization"));
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  if (payload.role === "user") return null;
  return payload;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireStaffAuth(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await connectDB();

    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      breakingArticles,
      todayArticles,
      viewsAggregation,
      topTrendingNews,
      recentNews,
      totalUsers,
      activeUsers,
      verifiedUsers,
      todayUsers,
      recentUsers,
      fcmSubscribers,
      totalCategories,
      totalComments,
      pollStats,
      seoDoc,
    ] = await Promise.all([
      News.countDocuments(),
      News.countDocuments({ published: { $ne: false } }),
      News.countDocuments({ published: false }),
      News.countDocuments({ isBreaking: true }),
      News.countDocuments({ createdAt: { $gte: last24h } }),
      News.aggregate([{ $group: { _id: null, totalViews: { $sum: "$views" } } }]),
      News.find().sort({ views: -1 }).limit(5).select("title views category date image slug").lean(),
      News.find().sort({ createdAt: -1 }).limit(10).lean(),
      User.countDocuments(),
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ isEmailVerified: true }),
      User.countDocuments({ createdAt: { $gte: last24h } }),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt isEmailVerified preferences").lean(),
      DeviceToken.countDocuments({ isActive: { $ne: false } }).catch(() => 0),
      Category.countDocuments().catch(() => 0),
      Comment.countDocuments().catch(() => 0),
      Poll.aggregate([{ $group: { _id: null, totalVotes: { $sum: "$totalVotes" } } }]).catch(() => []),
      GlobalSeo.findOne().sort({ updatedAt: -1 }).lean().catch(() => null),
    ]);

    const totalViews = viewsAggregation[0]?.totalViews || 0;
    const totalPollVotes = pollStats[0]?.totalVotes || 0;
    const seoScore = seoDoc?.audit?.healthScore ?? 88;

    return NextResponse.json({
      metrics: {
        articles: {
          total: totalArticles,
          published: publishedArticles,
          drafts: draftArticles,
          breaking: breakingArticles,
          today: todayArticles,
          totalViews,
          avgViews: totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers,
          today: todayUsers,
        },
        engagement: {
          fcmSubscribers,
          categories: totalCategories,
          comments: totalComments,
          pollVotes: totalPollVotes,
        },
        seo: {
          healthScore: seoScore,
        },
      },
      topTrendingNews,
      recentNews,
      recentUsers,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error loading dashboard metrics";
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

