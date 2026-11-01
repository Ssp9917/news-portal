"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  Bookmark,
  Clock,
  Mail,
  Phone,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Edit,
  X,
  ExternalLink,
} from "lucide-react";
import type { Role } from "@/lib/auth/rbac";

interface UserItem {
  _id: string;
  name?: string;
  email: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  phone?: string;
  avatar?: string;
  bio?: string;
  preferences?: {
    language?: string;
    city?: string;
    state?: string;
    categories?: string[];
    notificationTypes?: {
      breaking: boolean;
      local: boolean;
      digest: boolean;
      marketing: boolean;
    };
    dailyDigest?: string;
  };
  bookmarks?: string[];
  readingHistory?: Array<{
    newsId: string;
    title: string;
    slug: string;
    category: string;
    viewedAt: string;
  }>;
  createdAt: string;
}

interface StatsData {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  topCities: Array<{ _id: string; count: number }>;
  languageBreakdown: Array<{ _id: string; count: number }>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    bannedUsers: 0,
    topCities: [],
    languageBreakdown: [],
  });
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name?: string;
    role: Role;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [inspectUser, setInspectUser] = useState<UserItem | null>(null);
  const [inspectBookmarks, setInspectBookmarks] = useState<any[]>([]);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<UserItem | null>(null);
  const [newRole, setNewRole] = useState<Role>("user");
  const [deleteModalUser, setDeleteModalUser] = useState<UserItem | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "15",
        q: searchTerm,
        role: selectedRole,
        status: selectedStatus,
        language: selectedLanguage,
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401) router.push("/admin");
        throw new Error("Failed to load users");
      }

      const data = await res.json();
      setUsers(data.users || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
      if (data.stats) setStats(data.stats);
    } catch (err: unknown) {
      console.error(err);
      showToast("Error loading user records");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedRole, selectedStatus, selectedLanguage, router]);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    // Verify current admin user
    fetch("/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        } else {
          router.push("/admin");
        }
      })
      .catch(() => router.push("/admin"));

    fetchUsers();
  }, [fetchUsers, router]);

  // Handle active status toggle
  const toggleUserStatus = async (user: UserItem) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const updated = !user.isActive;
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: updated }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: updated } : u))
      );
      if (inspectUser && inspectUser._id === user._id) {
        setInspectUser({ ...inspectUser, isActive: updated });
      }
      showToast(updated ? "User account activated" : "User account suspended/banned");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle status";
      showToast(msg);
    }
  };

  // Handle role change
  const handleUpdateRole = async () => {
    if (!roleModalUser) return;
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${roleModalUser._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      setUsers((prev) =>
        prev.map((u) => (u._id === roleModalUser._id ? { ...u, role: newRole } : u))
      );
      if (inspectUser && inspectUser._id === roleModalUser._id) {
        setInspectUser({ ...inspectUser, role: newRole });
      }
      setRoleModalUser(null);
      showToast(`User role updated to ${newRole}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update role";
      showToast(msg);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!deleteModalUser) return;
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${deleteModalUser._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      setUsers((prev) => prev.filter((u) => u._id !== deleteModalUser._id));
      if (inspectUser && inspectUser._id === deleteModalUser._id) {
        setInspectUser(null);
      }
      setDeleteModalUser(null);
      showToast("User account permanently deleted");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete user";
      showToast(msg);
    }
  };

  // Inspect user full details
  const openInspectModal = async (user: UserItem) => {
    setInspectUser(user);
    setInspectBookmarks([]);
    setInspectLoading(true);

    const token = localStorage.getItem("admin_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setInspectUser(data.user);
        if (data.bookmarkedArticles) setInspectBookmarks(data.bookmarkedArticles);
      }
    } catch {
      // keep basic user data
    } finally {
      setInspectLoading(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    const params = new URLSearchParams({
      export: "csv",
      q: searchTerm,
      role: selectedRole,
      status: selectedStatus,
      language: selectedLanguage,
    });

    window.open(`/api/admin/users?${params.toString()}`, "_blank");
    showToast("Generating reader directory CSV download...");
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      case "admin":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      case "editor":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "author":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-[#070b14] text-slate-100 min-w-0">
      <AdminNav currentUser={currentUser} />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/90 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-red-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white shadow-lg shadow-red-900/30">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Readers & User Management
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Directory of registered news portal subscribers, editorial staff, and reader engagement metrics.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => fetchUsers()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-900/30 hover:opacity-95 transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Primary KPI Summary Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Users */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Registered Readers
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">
                {stats.totalUsers}
              </span>
              <span className="text-xs font-semibold text-emerald-400">
                {stats.activeUsers} Active
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {stats.bannedUsers > 0 ? `${stats.bannedUsers} suspended accounts` : "Zero suspended accounts"}
            </p>
          </div>

          {/* Card 2: Email Verified */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Verified Profiles
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">
                {stats.verifiedUsers}
              </span>
              <span className="text-xs font-semibold text-emerald-400 font-mono">
                {stats.totalUsers > 0 ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 100}%
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Authenticated via Google OAuth or Email
            </p>
          </div>

          {/* Card 3: Top Cities */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Top Reader Cities
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <MapPin className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-xs text-white font-medium truncate">
              {stats.topCities.length > 0
                ? stats.topCities.slice(0, 3).map((c) => `${c._id} (${c.count})`).join(", ")
                : "National Coverage"}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Hyperlocal geo-preference enabled
            </p>
          </div>

          {/* Card 4: Languages */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Language Preferences
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-bold text-white">
                Hindi (हिन्दी)
              </span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-bold text-slate-300">
                English
              </span>
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              Multilingual personalization active
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email, phone, or city..."
                className="w-full rounded-xl border border-white/10 bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                <option value="all">All Roles (सभी भूमिकाएँ)</option>
                <option value="user">Reader / User (पाठक)</option>
                <option value="author">Author / Journalist</option>
                <option value="editor">Editor (संपादक)</option>
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                <option value="all">All Statuses (सभी स्थिति)</option>
                <option value="active">Active Only (सक्रिय)</option>
                <option value="banned">Suspended / Banned (निलंबित)</option>
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-slate-900/90 px-3.5 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              >
                <option value="all">All Languages (भाषा)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="en">English</option>
                <option value="bn">Bangla (বাংলা)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Data Table */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto min-w-[760px]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">User / Reader</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Location & Lang</th>
                  <th className="py-3.5 px-4">Activity & Saves</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-red-500 mb-2" />
                      Loading user records...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Users className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                      No readers found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const initials = u.name
                      ? u.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : u.email[0].toUpperCase();

                    return (
                      <tr
                        key={u._id}
                        className="hover:bg-white/[0.03] transition-colors"
                      >
                        {/* 1. Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9a1418] via-[#c61d23] to-red-400 text-white font-bold text-xs shadow-md">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 font-bold text-white truncate max-w-[180px]">
                                <span>{u.name || "Reader"}</span>
                                {u.isEmailVerified && (
                                  <span title="Email Verified">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono truncate max-w-[180px]">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Role */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => {
                              setRoleModalUser(u);
                              setNewRole(u.role);
                            }}
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-80 ${getRoleBadge(
                              u.role
                            )}`}
                            title="Click to change role"
                          >
                            {u.role}
                          </button>
                        </td>

                        {/* 3. Location & Lang */}
                        <td className="py-3.5 px-4">
                          <div className="text-white font-medium flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                            <span>
                              {u.preferences?.city || "All India"}
                              {u.preferences?.state ? `, ${u.preferences.state}` : ""}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            Lang: {(u.preferences?.language || "hi").toUpperCase()}
                          </div>
                        </td>

                        {/* 4. Activity & Saves */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3 text-[11px] text-slate-300">
                            <span className="flex items-center gap-1 font-mono">
                              <Bookmark className="h-3 w-3 text-amber-400" />
                              {u.bookmarks?.length || 0} saves
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="h-3 w-3 text-blue-400" />
                              {u.readingHistory?.length || 0} read
                            </span>
                          </div>
                        </td>

                        {/* 5. Joined Date */}
                        <td className="py-3.5 px-4 text-[11px] text-slate-400 font-mono">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }) : "N/A"}
                        </td>

                        {/* 6. Active Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(u)}
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                              u.isActive !== false
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                                : "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                            }`}
                          >
                            {u.isActive !== false ? "Active (सक्रिय)" : "Banned (निलंबित)"}
                          </button>
                        </td>

                        {/* 7. Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openInspectModal(u)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                              title="Inspect full activity & preferences"
                            >
                              <Eye className="h-4 w-4 text-blue-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRoleModalUser(u);
                                setNewRole(u.role);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                              title="Change user role"
                            >
                              <Edit className="h-4 w-4 text-amber-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteModalUser(u)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                              title="Permanently delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 p-4 text-xs text-slate-400">
            <div>
              Showing <span className="font-bold text-white">{users.length}</span> of{" "}
              <span className="font-bold text-white">{totalCount}</span> registered readers
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>
              <span className="font-mono text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-semibold text-white disabled:opacity-30 hover:bg-white/10 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Modal 1: User Full Inspection Modal ── */}
        {inspectUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setInspectUser(null)}
                className="absolute top-5 right-5 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Top Profile Header */}
              <div className="flex items-start gap-4 pb-5 border-b border-white/10">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white font-black text-xl shadow-lg">
                  {inspectUser.name ? inspectUser.name[0].toUpperCase() : inspectUser.email[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">
                      {inspectUser.name || "Reader Profile"}
                    </h2>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getRoleBadge(
                        inspectUser.role
                      )}`}
                    >
                      {inspectUser.role}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        inspectUser.isActive !== false
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {inspectUser.isActive !== false ? "Active" : "Banned"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {inspectUser.email}
                  </div>
                  {inspectUser.phone && (
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3 text-emerald-400" />
                      <span>{inspectUser.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences Breakdown */}
              <div className="py-5 space-y-4 border-b border-white/10 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-300">
                  Reader Personalization Settings
                </h3>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                      Preferred Language
                    </span>
                    <span className="font-bold text-white mt-1 block">
                      {inspectUser.preferences?.language === "hi"
                        ? "हिन्दी (Hindi)"
                        : inspectUser.preferences?.language === "bn"
                        ? "বাংলা (Bangla)"
                        : "English"}
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                      Selected City & State
                    </span>
                    <span className="font-bold text-white mt-1 block">
                      {inspectUser.preferences?.city || "All India"}
                      {inspectUser.preferences?.state ? `, ${inspectUser.preferences.state}` : ""}
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                      Daily Digest
                    </span>
                    <span className="font-bold text-white mt-1 block capitalize">
                      {inspectUser.preferences?.dailyDigest || "Morning"}
                    </span>
                  </div>
                </div>

                {/* Followed Categories */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold mb-1.5">
                    Followed News Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectUser.preferences?.categories && inspectUser.preferences.categories.length > 0 ? (
                      inspectUser.preferences.categories.map((cat, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-red-600/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold"
                        >
                          {cat}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">No custom categories followed yet</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bookmarks Section */}
              <div className="py-5 border-b border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Bookmark className="h-4 w-4 text-amber-400" />
                    <span>Saved Bookmarks ({inspectUser.bookmarks?.length || 0})</span>
                  </span>
                </div>

                {inspectBookmarks.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {inspectBookmarks.map((art) => (
                      <div
                        key={art._id}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-2.5 text-xs hover:border-white/15"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <span className="text-[10px] font-bold text-red-400 uppercase mr-2">
                            {art.category}
                          </span>
                          <span className="font-medium text-white line-clamp-1">
                            {art.title}
                          </span>
                        </div>
                        <a
                          href={`/hi/news/${art.slug || art._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white"
                          title="Open article"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {inspectLoading ? "Loading saved bookmarks..." : "No articles bookmarked yet."}
                  </p>
                )}
              </div>

              {/* Reading History */}
              <div className="pt-5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>Recent Reading History ({inspectUser.readingHistory?.length || 0})</span>
                  </span>
                </div>

                {inspectUser.readingHistory && inspectUser.readingHistory.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {inspectUser.readingHistory.slice(0, 10).map((h, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] p-2 text-xs"
                      >
                        <span className="font-medium text-slate-200 line-clamp-1 flex-1 pr-2">
                          {h.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {h.viewedAt ? new Date(h.viewedAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No reading history recorded yet.</p>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleUserStatus(inspectUser)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    inspectUser.isActive !== false
                      ? "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                  }`}
                >
                  {inspectUser.isActive !== false ? "Suspend / Ban Account" : "Activate Account"}
                </button>

                <button
                  type="button"
                  onClick={() => setInspectUser(null)}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2 text-xs font-bold text-white transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal 2: Change User Role Modal ── */}
        {roleModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-900 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-amber-400" />
                  <span>Update User Role</span>
                </h3>
                <button
                  onClick={() => setRoleModalUser(null)}
                  className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Change access privileges for{" "}
                <strong className="text-white">{roleModalUser.name || roleModalUser.email}</strong>.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase">
                  Select Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="user">User / Reader (Default public access)</option>
                  <option value="author">Author (Create and edit own stories)</option>
                  <option value="editor">Editor (Publish, edit and review news)</option>
                  <option value="admin">Administrator (Full editorial & CMS control)</option>
                  {currentUser?.role === "super_admin" && (
                    <option value="super_admin">Super Administrator (Root privileges)</option>
                  )}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateRole}
                  className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-900/30 hover:opacity-95 transition-all"
                >
                  Save Role
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Modal 3: Delete Confirmation Modal ── */}
        {deleteModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-slate-900 p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Delete User Account</h3>
                  <p className="text-xs text-slate-400">
                    Are you sure you want to delete{" "}
                    <strong className="text-white">{deleteModalUser.name || deleteModalUser.email}</strong>?
                  </p>
                </div>
              </div>

              <p className="text-xs text-red-300/80 bg-red-950/40 p-3 rounded-xl border border-red-500/20">
                This action is irreversible. All reading history, bookmarks, and account preferences will be permanently wiped.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalUser(null)}
                  className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-900/30 transition-all"
                >
                  Yes, Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

