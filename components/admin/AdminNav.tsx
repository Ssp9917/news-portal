"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Palette,
  LayoutTemplate,
  FolderTree,
  Compass,
  Image as ImageIcon,
  Megaphone,
  SearchCode,
  ShieldCheck,
  LogOut,
  ExternalLink,
  PlusCircle,
  Menu,
  X,
  Sparkles,
  Bell,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Role } from "@/lib/auth/rbac";
import RoleBadge from "./RoleBadge";

interface AdminNavProps {
  currentUser?: {
    email: string;
    name?: string;
    role: Role;
  } | null;
}

export default function AdminNav({ currentUser }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Articles CMS",
      href: "/admin/dashboard?tab=articles",
      icon: FileText,
      badge: "News",
    },
    {
      label: "Users & Readers",
      href: "/admin/users",
      icon: Users,
      badge: "Directory",
    },
    {
      label: "Live Theme Editor",
      href: "/admin/theme-customizer",
      icon: Palette,
      badge: "Live",
    },
    {
      label: "Homepage Builder",
      href: "/admin/homepage-builder",
      icon: LayoutTemplate,
      badge: "Drag/Drop",
    },
    {
      label: "Category Manager",
      href: "/admin/categories",
      icon: FolderTree,
      badge: null,
    },
    {
      label: "Navigation Menu",
      href: "/admin/navigation",
      icon: Compass,
      badge: null,
    },
    {
      label: "Media Library",
      href: "/admin/media-library",
      icon: ImageIcon,
      badge: null,
    },
    {
      label: "Ad Manager",
      href: "/admin/advertisements",
      icon: Megaphone,
      badge: "AdSense",
    },
    {
      label: "Push Notifications",
      href: "/admin/notifications",
      icon: Bell,
      badge: "FCM",
    },
    {
      label: "Promotion Banners",
      href: "/admin/promotions",
      icon: Sparkles,
      badge: "Marketing",
    },
    {
      label: "SEO Control Panel",
      href: "/admin/seo-panel",
      icon: SearchCode,
      badge: "Audit",
    },
  ];

  if (currentUser?.role === "super_admin") {
    navItems.push({
      label: "Team & Super Admin",
      href: "/admin/super-admin",
      icon: ShieldCheck,
      badge: "Root",
    });
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-[#9a1418] via-[#c61d23] to-[#ef4444] text-white font-bold shadow-lg shadow-red-900/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-white tracking-wide text-sm">BHARAT PULSE</span>
            <span className="block text-[9px] text-red-400 font-bold uppercase tracking-wider">CMS STUDIO</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-slate-950/98 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9a1418] via-[#c61d23] to-[#ef4444] text-white shadow-xl shadow-red-900/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white text-base">
                <span>BHARAT PULSE</span>
                <span className="rounded bg-red-500/20 px-1 py-0.5 text-[10px] font-extrabold text-red-400">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-400">Advanced Editorial CMS</p>
            </div>
          </Link>
        </div>

        {/* Quick Action */}
        <div className="p-4">
          <Link
            href="/admin/add-news"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/35"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Write New Article</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href.includes("?") &&
                pathname === item.href.split("?")[0] &&
                typeof window !== "undefined" &&
                window.location.search.includes(item.href.split("?")[1]));

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border border-blue-500/30 shadow-md shadow-blue-500/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? "text-blue-400"
                        : "text-slate-500 group-hover:text-slate-300"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? "bg-blue-500/30 text-blue-300"
                        : "bg-white/10 text-slate-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Current User Card & Footer */}
        <div className="border-t border-white/10 p-4">
          {currentUser && (
            <div className="mb-3 rounded-xl border border-white/5 bg-white/5 p-3 backdrop-blur-md">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-400 truncate max-w-[140px]">
                  {currentUser.name || currentUser.email}
                </span>
                <RoleBadge role={currentUser.role} />
              </div>
              <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View Site</span>
            </Link>
            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
