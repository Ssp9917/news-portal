"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Building2, Plus, Trash2, Edit3, Check, X,
  Shield, Crown, ChevronDown, RefreshCw, Search,
  ToggleLeft, ToggleRight, ArrowLeft,
} from "lucide-react";
import RoleBadge from "@/components/admin/RoleBadge";
import type { Role } from "@/lib/auth/rbac";
import { ROLE_LABELS } from "@/lib/auth/rbac";
import Link from "next/link";

interface Admin {
  _id: string;
  email: string;
  name?: string;
  role: Role;
  tenantId?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  ownerId: string;
  isActive: boolean;
  createdAt: string;
}

const PLAN_COLORS = {
  free: "bg-gray-100 text-gray-700",
  pro: "bg-blue-100 text-blue-700",
  enterprise: "bg-purple-100 text-purple-700",
};

export default function SuperAdminPage() {
  const [tab, setTab] = useState<"admins" | "tenants">("admins");
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchAdmins, setSearchAdmins] = useState("");
  const [searchTenants, setSearchTenants] = useState("");

  // Create admin modal
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", name: "", password: "", role: "admin" as Role, tenantId: "" });
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  // Create tenant modal
  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: "", slug: "", plan: "free" as "free"|"pro"|"enterprise" });
  const [tenantError, setTenantError] = useState("");
  const [creatingTenant, setCreatingTenant] = useState(false);

  const router = useRouter();

  const getToken = () => localStorage.getItem("admin_token") ?? "";

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/super-admin/admins", { headers: authHeaders() });
      if (res.status === 403) { router.push("/admin/dashboard"); return; }
      const data = await res.json();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchTenants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/super-admin/tenants", { headers: authHeaders() });
      if (res.status === 403) { router.push("/admin/dashboard"); return; }
      const data = await res.json();
      setTenants(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push("/admin"); return; }
    fetchAdmins();
    fetchTenants();
  }, [fetchAdmins, fetchTenants, router]);

  const toggleAdmin = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/super-admin/admins/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ isActive: !isActive }),
      });
      setAdmins((prev) => prev.map((a) => a._id === id ? { ...a, isActive: !isActive } : a));
    } catch (e) { console.error(e); }
  };

  const changeRole = async (id: string, role: Role) => {
    try {
      await fetch(`/api/admin/super-admin/admins/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ role }),
      });
      setAdmins((prev) => prev.map((a) => a._id === id ? { ...a, role } : a));
    } catch (e) { console.error(e); }
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm("Permanently delete this admin?")) return;
    try {
      await fetch(`/api/admin/super-admin/admins/${id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch (e) { console.error(e); }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/super-admin/admins", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(newAdmin),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.message); return; }
      setAdmins((prev) => [data.user, ...prev]);
      setShowCreateAdmin(false);
      setNewAdmin({ email: "", name: "", password: "", role: "admin", tenantId: "" });
    } catch (e) {
      setCreateError("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setTenantError("");
    setCreatingTenant(true);
    try {
      const res = await fetch("/api/admin/super-admin/tenants", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(newTenant),
      });
      const data = await res.json();
      if (!res.ok) { setTenantError(data.message); return; }
      setTenants((prev) => [data.tenant, ...prev]);
      setShowCreateTenant(false);
      setNewTenant({ name: "", slug: "", plan: "free" });
    } catch (e) {
      setTenantError("Something went wrong");
    } finally {
      setCreatingTenant(false);
    }
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.email.toLowerCase().includes(searchAdmins.toLowerCase()) ||
      (a.name ?? "").toLowerCase().includes(searchAdmins.toLowerCase())
  );

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTenants.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTenants.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 border-b border-slate-800 bg-[#0f172a]">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20">
              <Crown className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <span className="text-base font-bold text-white">Super Admin Panel</span>
              <span className="ml-2 text-xs text-slate-500">Full system management</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* Hero Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { icon: <Users className="h-5 w-5" />, label: "Total Admins", value: admins.length, color: "bg-blue-50 text-blue-600" },
            { icon: <ToggleRight className="h-5 w-5" />, label: "Active", value: admins.filter(a => a.isActive).length, color: "bg-emerald-50 text-emerald-600" },
            { icon: <Building2 className="h-5 w-5" />, label: "Tenants", value: tenants.length, color: "bg-purple-50 text-purple-600" },
            { icon: <Shield className="h-5 w-5" />, label: "Pro+ Plans", value: tenants.filter(t => t.plan !== "free").length, color: "bg-amber-50 text-amber-600" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}>{s.icon}</div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl bg-white p-1 shadow-sm border border-gray-100 w-fit">
          {(["admins", "tenants"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-all ${
                tab === t
                  ? "bg-[#0f172a] text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {t === "admins" ? <Users className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              {t}
            </button>
          ))}
        </div>

        {/* ── Admins Panel ─────────────────────────────────── */}
        {tab === "admins" && (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-gray-900">Admin Users</h2>
                <p className="text-sm text-gray-500">{filteredAdmins.length} user{filteredAdmins.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search admins…"
                    className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20 sm:w-56"
                    value={searchAdmins}
                    onChange={(e) => setSearchAdmins(e.target.value)}
                  />
                </div>
                <button
                  onClick={fetchAdmins}
                  className="rounded-xl border border-gray-200 p-2 text-gray-400 transition-colors hover:bg-gray-50"
                  title="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => setShowCreateAdmin(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#D32F2F] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#B71C1C]"
                >
                  <Plus className="h-4 w-4" /> Add Admin
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-0 p-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="skeleton skeleton-round h-9 w-9" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton skeleton-text w-40" />
                      <div className="skeleton skeleton-text w-28" />
                    </div>
                    <div className="skeleton skeleton-round h-6 w-20" />
                    <div className="skeleton skeleton-text w-16" />
                  </div>
                ))}
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Users className="mx-auto mb-3 h-10 w-10 text-gray-200" />
                <p>No admins found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredAdmins.map((admin) => (
                  <div key={admin._id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-gray-50/60 sm:flex-row sm:items-center">
                    {/* Avatar */}
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-bold text-slate-600">
                      {(admin.name || admin.email)[0].toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{admin.name || "—"}</p>
                      <p className="truncate text-sm text-gray-500">{admin.email}</p>
                      {admin.tenantId && (
                        <p className="text-xs text-gray-400">Tenant: {admin.tenantId}</p>
                      )}
                    </div>

                    {/* Role select */}
                    <div className="relative flex-shrink-0">
                      <select
                        value={admin.role}
                        onChange={(e) => changeRole(admin._id, e.target.value as Role)}
                        className="appearance-none rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-8 text-sm font-medium outline-none focus:border-[#D32F2F] cursor-pointer"
                      >
                        {(["admin", "editor", "viewer"] as Role[]).map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Badge */}
                    <RoleBadge role={admin.role} size="sm" />

                    {/* Active toggle */}
                    <button
                      onClick={() => toggleAdmin(admin._id, admin.isActive)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        admin.isActive
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {admin.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                      {admin.isActive ? "Active" : "Inactive"}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteAdmin(admin._id)}
                      className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tenants Panel ─────────────────────────────────── */}
        {tab === "tenants" && (
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-col items-start justify-between gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-gray-900">Tenant Organizations</h2>
                <p className="text-sm text-gray-500">{filteredTenants.length} tenant{filteredTenants.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tenants…"
                    className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20 sm:w-56"
                    value={searchTenants}
                    onChange={(e) => setSearchTenants(e.target.value)}
                  />
                </div>
                <button
                  onClick={fetchTenants}
                  className="rounded-xl border border-gray-200 p-2 text-gray-400 transition-colors hover:bg-gray-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={() => setShowCreateTenant(true)}
                  className="flex items-center gap-2 rounded-xl bg-[#0f172a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" /> New Tenant
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-0 p-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-5">
                    <div className="skeleton h-10 w-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton skeleton-text w-36" />
                      <div className="skeleton skeleton-text w-24" />
                    </div>
                    <div className="skeleton skeleton-round h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <Building2 className="mx-auto mb-3 h-10 w-10 text-gray-200" />
                <p>No tenants yet. Create your first tenant organization.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredTenants.map((tenant) => (
                  <div key={tenant._id} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-gray-50/60 sm:flex-row sm:items-center">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-base font-bold text-slate-500">
                      {tenant.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{tenant.name}</p>
                      <p className="text-sm text-gray-500">/{tenant.slug}</p>
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${PLAN_COLORS[tenant.plan]}`}>
                      {tenant.plan}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tenant.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {tenant.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      {tenant.isActive ? "Active" : "Inactive"}
                    </span>
                    <p className="text-xs text-gray-400">{new Date(tenant.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Create Admin Modal ─────────────────────────────── */}
      {showCreateAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="font-bold text-gray-900">Create New Admin</h3>
              <button onClick={() => setShowCreateAdmin(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAdmin} className="space-y-4 p-6">
              {createError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{createError}</div>
              )}
              {[
                { label: "Full Name", key: "name", type: "text", placeholder: "John Doe", required: false },
                { label: "Email", key: "email", type: "email", placeholder: "admin@example.com", required: true },
                { label: "Password", key: "password", type: "password", placeholder: "••••••••", required: true },
              ].map(({ label, key, type, placeholder, required }) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    value={newAdmin[key as keyof typeof newAdmin]}
                    onChange={(e) => setNewAdmin({ ...newAdmin, [key]: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Role</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as Role })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20"
                >
                  {(["admin", "editor", "viewer"] as Role[]).map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Tenant ID <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                <select
                  value={newAdmin.tenantId}
                  onChange={(e) => setNewAdmin({ ...newAdmin, tenantId: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20"
                >
                  <option value="">No tenant (global)</option>
                  {tenants.map((t) => (
                    <option key={t._id} value={t._id}>{t.name} ({t.slug})</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAdmin(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-xl bg-[#D32F2F] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#B71C1C] disabled:opacity-60"
                >
                  {creating ? "Creating…" : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Create Tenant Modal ────────────────────────────── */}
      {showCreateTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="font-bold text-gray-900">Create New Tenant</h3>
              <button onClick={() => setShowCreateTenant(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateTenant} className="space-y-4 p-6">
              {tenantError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{tenantError}</div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Organization Name</label>
                <input
                  type="text"
                  placeholder="Acme News Co."
                  required
                  value={newTenant.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                    setNewTenant({ ...newTenant, name, slug });
                  }}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-[#D32F2F]/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Slug</label>
                <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 focus-within:border-[#D32F2F] focus-within:ring-2 focus-within:ring-[#D32F2F]/20">
                  <span className="bg-gray-50 px-3 py-2.5 text-sm text-gray-400 border-r border-gray-200">/tenant/</span>
                  <input
                    type="text"
                    placeholder="acme-news"
                    required
                    value={newTenant.slug}
                    onChange={(e) => setNewTenant({ ...newTenant, slug: e.target.value })}
                    className="flex-1 px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["free", "pro", "enterprise"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTenant({ ...newTenant, plan: p })}
                      className={`rounded-xl border-2 py-2 text-sm font-semibold capitalize transition-all ${
                        newTenant.plan === p
                          ? "border-[#D32F2F] bg-red-50 text-[#D32F2F]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTenant(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTenant}
                  className="flex-1 rounded-xl bg-[#0f172a] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {creatingTenant ? "Creating…" : "Create Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
