"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FileText, Eye, Edit3, Zap, Search, Plus, LogOut,
  ExternalLink, Trash2, Edit, Video, Shield, Users,
  BarChart3, Settings, Crown,
} from "lucide-react";
import RoleBadge from "@/components/admin/RoleBadge";
import type { Role } from "@/lib/auth/rbac";
import { hasPermission } from "@/lib/auth/rbac";

interface NewsItem {
  _id: string;
  title: string;
  category: string;
  date: string;
  image?: string;
  isBreaking?: boolean;
  videoUrl?: string;
  published?: boolean;
}

interface CurrentUser {
  id: string;
  email: string;
  name?: string;
  role: Role;
  tenantId?: string | null;
}

export default function AdminDashboard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [activeTab, setActiveTab] = useState<"articles" | "admins" | "analytics">("articles");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }
    fetchCurrentUser(token);
    fetchNews();
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
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchNews = async () => {
    setLoadingNews(true);
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        setNews(data);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoadingNews(false);
    }
  };

  const deleteNews = async (id: string) => {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNews(news.filter((item) => item._id !== id));
      } else {
        alert("Could not delete the article.");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/admin");
  };

  const totalArticles = news.length;
  const publishedArticles = news.filter((n) => n.published !== false).length;
  const breakingArticles = news.filter((n) => n.isBreaking).length;
  const videoArticles = news.filter((n) => n.videoUrl).length;

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canDelete = currentUser ? hasPermission(currentUser.role, "news:delete") : false;
  const canCreate = currentUser ? hasPermission(currentUser.role, "news:create") : false;
  const isSuperAdmin = currentUser?.role === "super_admin";

  if (loadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-[#D32F2F]" />
          <p className="text-sm text-slate-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* ── Top Nav ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-[#0f172a] shadow-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D32F2F] shadow-lg shadow-red-900/30">
              <FileText className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white">NewsAdmin</span>
              {isSuperAdmin && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                  <Crown className="h-3 w-3" /> SuperAdmin
                </span>
              )}
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden items-center gap-1 md:flex">
            <button
              onClick={() => setActiveTab("articles")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === "articles"
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              Articles
            </button>
            {isSuperAdmin && (
              <>
                <button
                  onClick={() => setActiveTab("admins")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === "admins"
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Admins
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === "analytics"
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </button>
                <Link
                  href="/admin/super-admin"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  Management
                </Link>
              </>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {currentUser && <RoleBadge role={currentUser.role} size="sm" />}
            <div className="hidden items-center gap-2 md:flex">
              <div className="h-4 w-px bg-slate-700" />
              <span className="max-w-[120px] truncate text-sm text-slate-400">
                {currentUser?.email}
              </span>
            </div>
            <Link
              href="/bn"
              target="_blank"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              title="View site"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* ── Stats Cards ───────────────────────────────────── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              icon: <FileText className="h-5 w-5" />,
              label: "Total Articles",
              value: totalArticles,
              color: "text-slate-600 bg-slate-100",
              border: "border-l-4 border-l-slate-400",
            },
            {
              icon: <Eye className="h-5 w-5" />,
              label: "Published",
              value: publishedArticles,
              color: "text-emerald-600 bg-emerald-50",
              border: "border-l-4 border-l-emerald-400",
            },
            {
              icon: <Zap className="h-5 w-5" />,
              label: "Breaking",
              value: breakingArticles,
              color: "text-red-600 bg-red-50",
              border: "border-l-4 border-l-red-400",
            },
            {
              icon: <Video className="h-5 w-5" />,
              label: "With Video",
              value: videoArticles,
              color: "text-blue-600 bg-blue-50",
              border: "border-l-4 border-l-blue-400",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm ${stat.border}`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Articles Tab ───────────────────────────────────── */}
        {activeTab === "articles" && (
          <>
            {/* Toolbar */}
            <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">All Articles</h2>
                <p className="text-sm text-gray-500">{filteredNews.length} article{filteredNews.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search articles…"
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm shadow-sm outline-none transition focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20 sm:w-72"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {canCreate && (
                  <Link
                    href="/admin/add-news"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[#D32F2F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-200 transition-all hover:bg-[#B71C1C] hover:shadow-md"
                  >
                    <Plus className="h-4 w-4" />
                    New Article
                  </Link>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="overflow-x-auto">
                {loadingNews ? (
                  <div className="space-y-0">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-6 py-4">
                        <div className="skeleton h-10 w-10 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="skeleton skeleton-text w-3/4" />
                          <div className="skeleton skeleton-text w-1/2" />
                        </div>
                        <div className="skeleton skeleton-round h-5 w-20" />
                        <div className="skeleton skeleton-text w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="border-b border-gray-100 bg-gray-50/60">
                      <tr>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Title</th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                        <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredNews.map((item) => (
                        <tr key={item._id} className="group transition-colors hover:bg-gray-50/70">
                          <td className="px-6 py-4">
                            <div className="flex min-w-[240px] items-center gap-3">
                              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 shadow-sm">
                                {item.image && (
                                  <Image src={item.image} alt="" fill className="object-cover" unoptimized />
                                )}
                              </div>
                              <span className="line-clamp-2 font-medium text-gray-900" title={item.title}>
                                {item.title}
                                {item.videoUrl && <Video className="ml-1.5 inline-block h-3.5 w-3.5 text-blue-500" />}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                              {item.category}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {item.isBreaking ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                                <Zap className="h-3 w-3" /> Breaking
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                <Eye className="h-3 w-3" /> Published
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-gray-500">{item.date}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <Link
                                href={`/admin/edit-news?id=${item._id}`}
                                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => deleteNews(item._id)}
                                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredNews.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-16 text-center">
                            <div className="flex flex-col items-center text-gray-400">
                              <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                                <FileText className="h-7 w-7 text-gray-300" />
                              </div>
                              <p className="font-medium">No articles found</p>
                              {canCreate && (
                                <Link href="/admin/add-news" className="mt-2 text-sm text-[#D32F2F] hover:underline">
                                  Create your first article →
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── Admins Tab (super_admin only) ─────────────────── */}
        {activeTab === "admins" && isSuperAdmin && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Admin Management</h2>
                <p className="text-sm text-gray-500">Manage all sub-admins and their roles</p>
              </div>
              <Link
                href="/admin/super-admin"
                className="flex items-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800"
              >
                <Users className="h-4 w-4" />
                Full Management Panel
              </Link>
            </div>
            <div className="flex items-center justify-center py-12 text-gray-400">
              <div className="text-center">
                <Shield className="mx-auto mb-3 h-12 w-12 text-gray-200" />
                <p className="font-medium">Go to the full Super Admin panel</p>
                <p className="mt-1 text-sm">Create and manage admins, editors, and tenants</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Analytics Tab ─────────────────────────────────── */}
        {activeTab === "analytics" && isSuperAdmin && (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="mb-2 text-lg font-bold text-gray-900">Analytics Overview</h2>
            <p className="mb-6 text-sm text-gray-500">Content performance at a glance</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                { label: "Total Articles", value: totalArticles, pct: "100%" },
                { label: "Published", value: publishedArticles, pct: `${totalArticles ? Math.round((publishedArticles / totalArticles) * 100) : 0}%` },
                { label: "Breaking", value: breakingArticles, pct: `${totalArticles ? Math.round((breakingArticles / totalArticles) * 100) : 0}%` },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-gray-50 p-5">
                  <p className="mb-1 text-sm text-gray-500">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{s.value}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-[#D32F2F] transition-all" style={{ width: s.pct }} />
                  </div>
                  <p className="mt-1 text-right text-xs text-gray-400">{s.pct}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
