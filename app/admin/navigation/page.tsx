"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import {
  Compass,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from "lucide-react";
import type { Role } from "@/lib/auth/rbac";

interface NavItem {
  id: string;
  label: string;
  labelHi?: string;
  href: string;
  isExternal?: boolean;
  order: number;
  isEnabled: boolean;
}

interface FooterGroup {
  title: string;
  links: { label: string; href: string }[];
}

export default function NavigationManagerPage() {
  const [headerLinks, setHeaderLinks] = useState<NavItem[]>([]);
  const [footerGroups, setFooterGroups] = useState<FooterGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    name?: string;
    role: Role;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }
    fetchCurrentUser(token);
    fetchNavConfig();
  }, [router]);

  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch {}
  };

  const fetchNavConfig = async () => {
    try {
      const res = await fetch("/api/admin/navigation");
      if (res.ok) {
        const data = await res.json();
        if (data.headerLinks) setHeaderLinks(data.headerLinks);
        if (data.footerGroups) setFooterGroups(data.footerGroups);
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

  const addHeaderLink = () => {
    const newLink: NavItem = {
      id: `nav-${Date.now()}`,
      label: "New Link",
      labelHi: "नया लिंक",
      href: "/category/national",
      isExternal: false,
      order: headerLinks.length + 1,
      isEnabled: true,
    };
    setHeaderLinks([...headerLinks, newLink]);
  };

  const removeHeaderLink = (id: string) => {
    setHeaderLinks(headerLinks.filter((l) => l.id !== id));
  };

  const moveLink = (index: number, dir: "up" | "down") => {
    const target = dir === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= headerLinks.length) return;
    const copy = [...headerLinks];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    copy.forEach((l, i) => (l.order = i + 1));
    setHeaderLinks(copy);
  };

  const updateHeaderLink = <K extends keyof NavItem>(
    index: number,
    field: K,
    val: NavItem[K]
  ) => {
    const copy = [...headerLinks];
    copy[index][field] = val;
    setHeaderLinks(copy);
  };

  const addFooterLink = (groupIndex: number) => {
    const copy = [...footerGroups];
    copy[groupIndex].links.push({ label: "New Footer Link", href: "/" });
    setFooterGroups(copy);
  };

  const removeFooterLink = (groupIndex: number, linkIndex: number) => {
    const copy = [...footerGroups];
    copy[groupIndex].links = copy[groupIndex].links.filter((_, i) => i !== linkIndex);
    setFooterGroups(copy);
  };

  const updateFooterLink = (
    groupIndex: number,
    linkIndex: number,
    field: "label" | "href",
    val: string
  ) => {
    const copy = [...footerGroups];
    copy[groupIndex].links[linkIndex][field] = val;
    setFooterGroups(copy);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ headerLinks, footerGroups }),
      });
      if (res.ok) {
        showToast("Navigation settings saved successfully!");
      } else {
        showToast("Error saving navigation");
      }
    } catch {
      showToast("Network error");
    } finally {
      setSaving(false);
    }
  };

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
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Compass className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Navigation & Menu Manager
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Customize the header bar links, dropdown menus, and multi-column footer navigation.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save Navigation"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Header Links Section (Left 7 cols) */}
          <div className="space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Primary Header Navigation ({headerLinks.length})
              </h2>
              <button
                onClick={addHeaderLink}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                <Plus className="h-3.5 w-3.5 text-blue-400" />
                <span>Add Header Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {headerLinks.map((link, idx) => (
                <div
                  key={link.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveLink(idx, "up")}
                      disabled={idx === 0}
                      className="text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveLink(idx, "down")}
                      disabled={idx === headerLinks.length - 1}
                      className="text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        Hindi Label
                      </label>
                      <input
                        type="text"
                        value={link.labelHi || ""}
                        onChange={(e) =>
                          updateHeaderLink(idx, "labelHi", e.target.value)
                        }
                        placeholder="e.g. राजनीति"
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        English Label
                      </label>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) =>
                          updateHeaderLink(idx, "label", e.target.value)
                        }
                        placeholder="e.g. Politics"
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">
                        Target Link / Path
                      </label>
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) =>
                          updateHeaderLink(idx, "href", e.target.value)
                        }
                        placeholder="/category/politics"
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeHeaderLink(link.id)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Groups Section (Right 5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Footer Columns ({footerGroups.length})
              </h2>
            </div>

            <div className="space-y-4">
              {footerGroups.map((group, gIdx) => (
                <div
                  key={group.title + gIdx}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <input
                      type="text"
                      value={group.title}
                      onChange={(e) => {
                        const copy = [...footerGroups];
                        copy[gIdx].title = e.target.value;
                        setFooterGroups(copy);
                      }}
                      className="font-bold text-white text-sm bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => addFooterLink(gIdx)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      + Add Link
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    {group.links.map((link, lIdx) => (
                      <div key={lIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) =>
                            updateFooterLink(gIdx, lIdx, "label", e.target.value)
                          }
                          placeholder="Link Label"
                          className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-white"
                        />
                        <input
                          type="text"
                          value={link.href}
                          onChange={(e) =>
                            updateFooterLink(gIdx, lIdx, "href", e.target.value)
                          }
                          placeholder="/path"
                          className="w-36 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 font-mono text-white"
                        />
                        <button
                          onClick={() => removeFooterLink(gIdx, lIdx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
