"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import AdminNav from "@/components/admin/AdminNav";
import {
  FileText,
  Eye,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Flame,
  Search,
  Sparkles,
  TrendingUp,
  LayoutTemplate,
  Palette,
  FolderTree,
  SearchCode,
  CheckCircle2,
  Clock,
  User,
  Users,
  Zap,
  Bell,
  RefreshCw,
  Heart,
  MessageSquare,
  Vote,
} from "lucide-react";
import type { Role } from "@/lib/auth/rbac";
import { hasPermission } from "@/lib/auth/rbac";

interface NewsItem {
  _id: string;
  title: string;
  category: string;
  categoryColor?: string;
  date: string;
  image?: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  videoUrl?: string;
  published?: boolean;
  views?: number;
  author?: string;
  slug?: string;
  createdAt: string;
}

interface CurrentUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
}

interface DashboardMetrics {
  articles: {
    total: number;
    published: number;
    drafts: number;
    breaking: number;
    today: number;
    totalViews: number;
    avgViews: number;
  };
  users: {
    total: number;
    active: number;
    verified: number;
    today: number;
  };
  engagement: {
    fcmSubscribers: number;
    categories: number;
    comments: number;
    pollVotes: number;
  };
  seo: {
    healthScore: number;
  };
}

interface RecentUserItem {
  _id: string;
  name?: string;
  email: string;
  role: string;
  createdAt: string;
  isEmailVerified: boolean;
  preferences?: { city?: string; language?: string };
}

export default function AdminDashboardPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    articles: { total: 0, published: 0, drafts: 0, breaking: 0, today: 0, totalViews: 0, avgViews: 0 },
    users: { total: 0, active: 0, verified: 0, today: 0 },
    engagement: { fcmSubscribers: 0, categories: 0, comments: 0, pollVotes: 0 },
    seo: { healthScore: 88 },
  });
  const [recentUsers, setRecentUsers] = useState<RecentUserItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }
    fetchCurrentUser(token);
    fetchData();
  }, [router]);

  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        router.push("/admin");
      }
    } catch {
      router.push("/admin");
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem("admin_token");
    setLoading(true);
    try {
      const [dashRes, newsRes, catRes] = await Promise.all([
        fetch("/api/admin/dashboard", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch("/api/news?limit=100"),
        fetch("/api/admin/categories"),
      ]);

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        if (dashData.metrics) setMetrics(dashData.metrics);
        if (dashData.recentUsers) setRecentUsers(dashData.recentUsers);
      }

      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNews(newsData);
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const deleteNews = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article? This action cannot be undone.")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNews(news.filter((item) => item._id !== id));
        showToast("Article deleted successfully");
      } else {
        showToast("Could not delete the article.");
      }
    } catch {
      showToast("Network error deleting article");
    }
  };

  const toggleBreaking = async (item: NewsItem) => {
    try {
      const token = localStorage.getItem("admin_token");
      const updated = !item.isBreaking;
      const res = await fetch(`/api/news/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isBreaking: updated }),
      });
      if (res.ok) {
        setNews(
          news.map((n) => (n._id === item._id ? { ...n, isBreaking: updated } : n))
        );
        showToast(updated ? "Marked as Breaking News" : "Removed Breaking News tag");
      }
    } catch {}
  };

  const totalViews =
    metrics.articles.totalViews || news.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalArticles = metrics.articles.total || news.length;
  const publishedCount =
    metrics.articles.published || news.filter((n) => n.published !== false).length;
  const breakingCount =
    metrics.articles.breaking || news.filter((n) => n.isBreaking).length;
  const totalUsersCount = metrics.users.total;
  const activeUsersCount = metrics.users.active;
  const fcmCount = metrics.engagement.fcmSubscribers;
  const seoScore = metrics.seo.healthScore || 88;

  const topNews = [...news].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.author && item.author.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" ||
      item.category === selectedCategory ||
      item.category ===
        categories.find((c) => c.slug === selectedCategory)?.name;

    return matchesSearch && matchesCategory;
  });

  const canCreate = currentUser ? hasPermission(currentUser.role, "news:create") : false;
  const canDelete = currentUser ? hasPermission(currentUser.role, "news:delete") : false;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#070b14] text-slate-100">
      <AdminNav currentUser={currentUser} />

      <main className="flex-1 w-full min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-950/90 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white lg:text-3xl">
              Editorial CMS Dashboard
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Welcome back, <strong className="text-white">{currentUser?.name || currentUser?.email || "Editor"}</strong>.
              Here is your real-time publication & reader analytics overview.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fetchData()}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white transition-all"
              title="Refresh live metrics"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-300 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/admin/theme-customizer"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
            >
              <Palette className="h-3.5 w-3.5 text-blue-400" />
              <span>Customize Theme</span>
            </Link>
            {canCreate && (
              <Link
                href="/admin/add-news"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-900/30 hover:opacity-95 hover:scale-[1.02] transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Publish Article</span>
              </Link>
            )}
          </div>
        </div>

        {/* 6 Primary Live KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Card 1: Total Stories */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Stories
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <FileText className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">
                {totalArticles}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {publishedCount} Active
              </span>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400 truncate">
              {metrics.articles.today > 0 ? `+${metrics.articles.today} added today` : `Across ${categories.length} beats`}
            </p>
          </div>

          {/* Card 2: Total Readership Views */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Readership Views
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Eye className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono truncate">
                {totalViews.toLocaleString()}
              </span>
            </div>
            <p className="mt-1.5 text-[10px] text-blue-400 font-semibold truncate">
              ~{metrics.articles.avgViews || 0} avg reads/story
            </p>
          </div>

          {/* Card 3: Registered Readers */}
          <Link
            href="/admin/users"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-xl shadow-black/10 hover:border-red-500/40 transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-red-300">
                Readers / Users
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                <Users className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white font-mono">
                {totalUsersCount}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                {activeUsersCount} Active
              </span>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400 truncate">
              {metrics.users.today > 0 ? `+${metrics.users.today} joined today` : "Click to view directory"}
            </p>
          </Link>

          {/* Card 4: Push Notification Subscribers */}
          <Link
            href="/admin/notifications"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-xl shadow-black/10 hover:border-amber-500/40 transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-amber-300">
                Subscribers
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <Bell className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {fcmCount}
              </span>
              <span className="text-[11px] text-slate-400">Devices</span>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400 truncate">
              FCM Broadcast Ready
            </p>
          </Link>

          {/* Card 5: Breaking News Alerts */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Breaking Alerts
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                <Zap className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-rose-400 font-mono">
                {breakingCount}
              </span>
              <span className="text-[11px] text-slate-400">Marquee</span>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400 truncate">
              Live banner on top
            </p>
          </div>

          {/* Card 6: SEO Health Score */}
          <Link
            href="/admin/seo-panel"
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-xl shadow-black/10 hover:border-cyan-500/40 transition-all block"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 group-hover:text-cyan-300">
                SEO Health
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <SearchCode className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {seoScore}%
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">Healthy</span>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400 truncate">
              Google Sitemap & JSON-LD
            </p>
          </Link>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <Link
            href="/admin/users"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-red-500/40 hover:bg-red-950/20 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/20 text-red-400 shrink-0">
              <Users className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Readers</p>
              <p className="text-[10px] text-slate-400 truncate">Directory</p>
            </div>
          </Link>

          <Link
            href="/admin/comments"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-emerald-500/40 hover:bg-emerald-950/20 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Comments</p>
              <p className="text-[10px] text-slate-400 truncate">Moderation</p>
            </div>
          </Link>

          <Link
            href="/admin/polls"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-purple-500/40 hover:bg-purple-950/20 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400 shrink-0">
              <Vote className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Opinion Polls</p>
              <p className="text-[10px] text-slate-400 truncate">Audience Votes</p>
            </div>
          </Link>

          <Link
            href="/admin/notifications"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-amber-500/40 hover:bg-amber-950/20 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600/20 text-amber-400 shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Push Alerts</p>
              <p className="text-[10px] text-slate-400 truncate">FCM Broadcast</p>
            </div>
          </Link>

          <Link
            href="/admin/homepage-builder"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-indigo-500/40 hover:bg-indigo-950/20 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 shrink-0">
              <LayoutTemplate className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Homepage</p>
              <p className="text-[10px] text-slate-400 truncate">Sections & Order</p>
            </div>
          </Link>

          <Link
            href="/admin/theme-customizer"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-blue-500/40 hover:bg-blue-950/20 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 shrink-0">
              <Palette className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Live Theme</p>
              <p className="text-[10px] text-slate-400 truncate">Colors & Fonts</p>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-emerald-500/40 hover:bg-emerald-950/20 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 shrink-0">
              <FolderTree className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">Categories</p>
              <p className="text-[10px] text-slate-400 truncate">News Beats</p>
            </div>
          </Link>

          <Link
            href="/admin/seo-panel"
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600/20 text-cyan-400 shrink-0">
              <SearchCode className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">SEO & Socials</p>
              <p className="text-[10px] text-slate-400 truncate">Meta & Links</p>
            </div>
          </Link>
        </div>

        {/* Dual Analytics Row: Trending Stories & Recent Readers */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Top Trending Articles (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Flame className="h-4 w-4 text-amber-400" />
                <span>Trending Reader Favorites</span>
              </h2>
              <span className="text-[11px] text-slate-400">Ranked by verified reads</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {topNews.map((item, i) => (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/60 p-3.5 transition-all hover:border-blue-500/40 hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-mono font-bold text-amber-300">
                      #{i + 1}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-blue-400" title="Views (पाठक दृश्य)">
                        <Eye className="h-3 w-3" />
                        {(item.views || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-rose-400" title="Likes (लाइक्स)">
                        <Heart className="h-3 w-3 fill-rose-500/40" />
                        {((item as any).likes || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400" title="Comments (टिप्पणियां)">
                        <MessageSquare className="h-3 w-3" />
                        {((item as any).commentsCount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <h4 className="font-bold text-xs leading-snug text-white line-clamp-2 group-hover:text-blue-300">
                    {item.title}
                  </h4>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate text-red-400 font-semibold">{item.category}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Recent Reader Registrations (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Users className="h-4 w-4 text-red-400" />
                  <span>Recent Reader Signups</span>
                </h2>
                <Link
                  href="/admin/users"
                  className="text-[11px] font-bold text-red-400 hover:underline"
                >
                  All ({totalUsersCount}) →
                </Link>
              </div>

              <div className="space-y-2.5">
                {recentUsers.length > 0 ? (
                  recentUsers.slice(0, 4).map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-900/40 p-2.5 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 font-bold text-white truncate">
                          <span>{u.name || "Reader"}</span>
                          {u.isEmailVerified && (
                            <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {u.email}
                        </div>
                      </div>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase text-slate-300 shrink-0">
                        {u.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic py-6 text-center">
                    No recent readers recorded yet.
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/admin/users"
              className="mt-4 block text-center rounded-xl bg-white/5 hover:bg-white/10 py-2 text-xs font-bold text-white transition-colors border border-white/10"
            >
              Open Readers Directory
            </Link>
          </div>
        </div>

        {/* Main Articles CMS Table */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
          {/* Table Header Controls */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center max-w-xl">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search articles by headline, author, or beat..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredNews.length} of {news.length}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Story</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Author</th>
                  <th className="py-3.5 px-4 font-semibold">Date</th>
                  <th className="py-3.5 px-4 font-semibold">Views</th>
                  <th className="py-3.5 px-4 font-semibold">Breaking</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredNews.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Story Title & Image */}
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-800">
                          <img
                            src={item.image || "https://placehold.co/120x80"}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-xs line-clamp-2 hover:text-blue-400">
                            <Link href={`/hi/news/${item.slug || item._id}`} target="_blank">
                              {item.title}
                            </Link>
                          </h4>
                          {item.isFeatured && (
                            <span className="mt-0.5 inline-block rounded bg-blue-500/20 px-1.5 py-0.2 text-[9px] font-bold text-blue-300">
                              Featured Story
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200">
                        {item.category}
                      </span>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {item.author || "Editorial Desk"}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono">
                      {item.date}
                    </td>

                    {/* Views */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                      {(item.views || 0).toLocaleString()}
                    </td>

                    {/* Breaking Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => toggleBreaking(item)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition-all ${
                          item.isBreaking
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : "bg-white/5 text-slate-500 border border-white/5 hover:text-white"
                        }`}
                      >
                        {item.isBreaking ? "Active" : "Off"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/hi/news/${item.slug || item._id}`}
                          target="_blank"
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                          title="Preview Live Story"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/admin/edit-news?id=${item._id}`}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                          title="Edit Story"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                        {canDelete && (
                          <button
                            onClick={() => deleteNews(item._id)}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                            title="Delete Story"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
