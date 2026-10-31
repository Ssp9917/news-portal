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
  Zap,
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

export default function AdminDashboardPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [seoScore, setSeoScore] = useState<number>(85);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
    try {
      const [newsRes, catRes, seoRes] = await Promise.all([
        fetch("/api/news?limit=100"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/seo"),
      ]);

      if (newsRes.ok) {
        const newsData = await newsRes.json();
        setNews(newsData);
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      if (seoRes.ok) {
        const seoData = await seoRes.json();
        if (seoData?.audit?.healthScore !== undefined) {
          setSeoScore(seoData.audit.healthScore);
        }
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

  const totalViews = news.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalArticles = news.length;
  const publishedCount = news.filter((n) => n.published !== false).length;
  const breakingCount = news.filter((n) => n.isBreaking).length;

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
    <div className="flex min-h-screen bg-[#070b14] text-slate-100">
      <AdminNav currentUser={currentUser} />

      <main className="flex-1 overflow-y-auto p-4 lg:p-8">
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-950/90 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
              Editorial CMS Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Welcome back, <strong className="text-white">{currentUser?.name || currentUser?.email || "Editor"}</strong>.
              Here is your publication overview.
            </p>
          </div>

          <div className="flex items-center gap-3">
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
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Publish Article</span>
              </Link>
            )}
          </div>
        </div>

        {/* 4 Primary KPI Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Stories */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Stories
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">
                {totalArticles}
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                {publishedCount} Active
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Across {categories.length} dynamic categories
            </p>
          </div>

          {/* Card 2: Total Readership Views */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Readership Views
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Eye className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white font-mono">
                {totalViews.toLocaleString()}
              </span>
              <span className="text-xs text-blue-400 font-semibold">Live Traffic</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Avg. {totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0} reads per story
            </p>
          </div>

          {/* Card 3: Breaking News Ticker */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Breaking Alerts
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                <Zap className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-red-400 font-mono">
                {breakingCount}
              </span>
              <span className="text-xs text-slate-400">On Marquee</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Live banner on homepage top
            </p>
          </div>

          {/* Card 4: SEO Health Score */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl shadow-black/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                SEO Audit Score
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <SearchCode className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-cyan-400 font-mono">
                {seoScore}%
              </span>
              <span className="text-xs text-emerald-400 font-semibold">High Health</span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Google News Sitemap & JSON-LD active
            </p>
          </div>
        </div>

        {/* Quick Management Shortcuts */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/admin/theme-customizer"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 hover:border-blue-500/40 hover:bg-blue-950/20 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Live Theme Editor</p>
              <p className="text-[11px] text-slate-400">Colors, Blur & Styles</p>
            </div>
          </Link>

          <Link
            href="/admin/homepage-builder"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 hover:border-indigo-500/40 hover:bg-indigo-950/20 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400">
              <LayoutTemplate className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Homepage Builder</p>
              <p className="text-[11px] text-slate-400">Drag & Drop Sections</p>
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 hover:border-emerald-500/40 hover:bg-emerald-950/20 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400">
              <FolderTree className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Categories</p>
              <p className="text-[11px] text-slate-400">Manage News Beats</p>
            </div>
          </Link>

          <Link
            href="/admin/seo-panel"
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600/20 text-cyan-400">
              <SearchCode className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">SEO Health Panel</p>
              <p className="text-[11px] text-slate-400">Audit & Sitemaps</p>
            </div>
          </Link>
        </div>

        {/* Top 4 Most Popular Articles Leaderboard */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
              <Flame className="h-4 w-4 text-amber-400" />
              <span>Trending Reader Favorites</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topNews.map((item, i) => (
              <div
                key={item._id}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/60 p-3.5 transition-all hover:border-blue-500/40 hover:bg-slate-900"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-mono font-bold text-amber-300">
                    #{i + 1}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-xs font-bold text-blue-400">
                    <Eye className="h-3 w-3" />
                    {(item.views || 0).toLocaleString()}
                  </span>
                </div>
                <h4 className="font-bold text-xs leading-snug text-white line-clamp-2 group-hover:text-blue-300">
                  {item.title}
                </h4>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate">{item.category}</span>
                  <span>{item.date}</span>
                </div>
              </div>
            ))}
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
