"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  X,
  ExternalLink,
  Code,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Role } from "@/lib/auth/rbac";

interface AdItem {
  _id?: string;
  title: string;
  slot:
    | "header_top"
    | "hero_after"
    | "feed_inline"
    | "article_sidebar"
    | "article_content"
    | "footer_above"
    | "mobile_sticky";
  adType: "adsense" | "custom_banner" | "html_code";
  adCode?: string;
  imageUrl?: string;
  targetUrl?: string;
  isActive: boolean;
  impressions?: number;
  clicks?: number;
}

const AD_SLOTS = [
  { id: "header_top", label: "Header Top Leaderboard (728x90 / Responsive)" },
  { id: "hero_after", label: "After Hero Section (Responsive Billboard)" },
  { id: "feed_inline", label: "Latest News Feed Inline Slot" },
  { id: "article_sidebar", label: "Article Sticky Sidebar (300x600 Half-page)" },
  { id: "article_content", label: "In-Article Content Paragraph Banner" },
  { id: "footer_above", label: "Above Footer Large Leaderboard" },
  { id: "mobile_sticky", label: "Mobile Sticky Bottom Anchor Ad" },
];

export default function AdManagerPage() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    fetchAds();
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

  const fetchAds = async () => {
    try {
      const res = await fetch("/api/admin/ads");
      if (res.ok) {
        const data = await res.json();
        setAds(data);
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

  const openCreateModal = () => {
    setEditingAd({
      title: "",
      slot: "header_top",
      adType: "custom_banner",
      adCode: "",
      imageUrl: "",
      targetUrl: "",
      isActive: true,
      impressions: 0,
      clicks: 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ad: AdItem) => {
    setEditingAd({ ...ad });
    setIsModalOpen(true);
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");
      const isEdit = Boolean(editingAd._id);
      const url = isEdit
        ? `/api/admin/ads/${editingAd._id}`
        : "/api/admin/ads";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingAd),
      });

      if (res.ok) {
        showToast(
          isEdit ? "Ad placement updated!" : "Ad placement created successfully!"
        );
        setIsModalOpen(false);
        fetchAds();
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to save ad");
      }
    } catch {
      showToast("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!confirm("Are you sure you want to remove this advertisement?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/ads/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast("Ad removed");
        setAds(ads.filter((a) => a._id !== id));
      }
    } catch {
      showToast("Network error");
    }
  };

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
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <Megaphone className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Advertisement & Revenue Manager
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Configure Google AdSense auto-units, responsive custom banners, and affiliate tracking.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create Ad Placement</span>
          </button>
        </div>

        {/* Ad Placements List */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ads.map((ad) => {
            const slotObj = AD_SLOTS.find((s) => s.id === ad.slot);
            return (
              <div
                key={ad._id}
                className={`rounded-2xl border p-5 backdrop-blur-xl transition-all ${
                  ad.isActive
                    ? "border-white/10 bg-white/5 shadow-xl shadow-black/20"
                    : "border-white/5 bg-white/[0.02] opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      {ad.adType}
                    </span>
                    <h3 className="mt-2 text-base font-bold text-white">{ad.title}</h3>
                    <p className="mt-0.5 text-xs text-slate-400">{slotObj?.label}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(ad)}
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => ad._id && handleDeleteAd(ad._id)}
                      className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Banner Thumbnail Preview or Code Snippet */}
                {ad.adType === "custom_banner" && ad.imageUrl && (
                  <div className="relative mt-3 aspect-[16/6] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {ad.adType === "adsense" && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-950/20 p-2.5 text-[11px] text-amber-300">
                    <Code className="h-4 w-4 shrink-0" />
                    <span>Google AdSense Slot Auto-Managed</span>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    {ad.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <Eye className="h-3.5 w-3.5" /> Live Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500 font-semibold">
                        <EyeOff className="h-3.5 w-3.5" /> Paused
                      </span>
                    )}
                  </div>
                  {ad.targetUrl && (
                    <a
                      href={ad.targetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:underline"
                    >
                      <span>Destination</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Add/Edit Ad */}
        {isModalOpen && editingAd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-slate-950 p-6 shadow-2xl backdrop-blur-2xl">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white">
                  {editingAd._id ? "Edit Ad Placement" : "Create New Ad Placement"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAd} className="space-y-4 text-xs">
                <div>
                  <label className="mb-1 block font-semibold text-slate-300">
                    Placement Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAd.title}
                    onChange={(e) =>
                      setEditingAd({ ...editingAd, title: e.target.value })
                    }
                    placeholder="e.g. Hero Section Billboard"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-300">
                      Ad Slot Location
                    </label>
                    <select
                      value={editingAd.slot}
                      onChange={(e) =>
                        setEditingAd({
                          ...editingAd,
                          slot: e.target.value as AdItem["slot"],
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    >
                      {AD_SLOTS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-slate-300">
                      Ad Provider Type
                    </label>
                    <select
                      value={editingAd.adType}
                      onChange={(e) =>
                        setEditingAd({
                          ...editingAd,
                          adType: e.target.value as AdItem["adType"],
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="custom_banner">Custom Banner Image</option>
                      <option value="adsense">Google AdSense</option>
                      <option value="html_code">Custom HTML / Script</option>
                    </select>
                  </div>
                </div>

                {editingAd.adType === "custom_banner" && (
                  <>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-300">
                        Banner Image URL
                      </label>
                      <input
                        type="url"
                        value={editingAd.imageUrl || ""}
                        onChange={(e) =>
                          setEditingAd({ ...editingAd, imageUrl: e.target.value })
                        }
                        placeholder="https://.../banner.png"
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-mono text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block font-semibold text-slate-300">
                        Target Click URL
                      </label>
                      <input
                        type="url"
                        value={editingAd.targetUrl || ""}
                        onChange={(e) =>
                          setEditingAd({ ...editingAd, targetUrl: e.target.value })
                        }
                        placeholder="https://sponsor.com/offer"
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-mono text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {editingAd.adType !== "custom_banner" && (
                  <div>
                    <label className="mb-1 block font-semibold text-slate-300">
                      Ad Code / Snippet
                    </label>
                    <textarea
                      rows={3}
                      value={editingAd.adCode || ""}
                      onChange={(e) =>
                        setEditingAd({ ...editingAd, adCode: e.target.value })
                      }
                      placeholder="<!-- Paste Google AdSense or HTML banner code here -->"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-mono text-xs text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAd.isActive}
                      onChange={(e) =>
                        setEditingAd({ ...editingAd, isActive: e.target.checked })
                      }
                      className="rounded accent-blue-600"
                    />
                    <span className="font-semibold text-white">Placement Active</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 font-semibold text-slate-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "Saving..." : "Save Placement"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
