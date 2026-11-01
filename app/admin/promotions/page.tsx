"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  MousePointerClick,
  Sparkles,
  Smartphone,
  Laptop,
  X,
  ExternalLink,
} from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

interface BannerItem {
  _id: string;
  name: string;
  type: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl: string;
  bgGradient: string;
  textColor: string;
  isActive: boolean;
  frequency: string;
  stats: {
    impressions: number;
    clicks: number;
  };
  createdAt: string;
}

export default function AdminPromotionsManager() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState("announcement_strip");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("देखें (Explore)");
  const [ctaUrl, setCtaUrl] = useState("/");
  const [bgGradient, setBgGradient] = useState("from-[#9a1418] via-[#c61d23] to-slate-900");
  const [frequency, setFrequency] = useState("always");
  const [device, setDevice] = useState("all");

  const loadBanners = async () => {
    try {
      const res = await fetch("/api/admin/promotions");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim() || !ctaUrl.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          title,
          subtitle,
          ctaText,
          ctaUrl,
          bgGradient,
          frequency,
          targetAudience: { device, segment: "all" },
          isActive: true,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        resetForm();
        loadBanners();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (banner: BannerItem) => {
    try {
      const res = await fetch(`/api/admin/promotions/${banner._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b._id === banner._id ? { ...b, isActive: !b.isActive } : b))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("क्या आप वाकई इस प्रमोशन बैनर को हटाना चाहते हैं?")) {
      await fetch(`/api/admin/promotions/${id}`, { method: "DELETE" });
      setBanners((prev) => prev.filter((b) => b._id !== id));
    }
  };

  const resetForm = () => {
    setName("");
    setTitle("");
    setSubtitle("");
    setCtaText("देखें (Explore)");
    setCtaUrl("/");
    setType("announcement_strip");
  };

  const gradientPresets = [
    { label: "रेड पल्स (Red Pulse)", value: "from-[#9a1418] via-[#c61d23] to-slate-900" },
    { label: "डीप नेवी (Deep Navy)", value: "from-blue-950 via-indigo-900 to-slate-950" },
    { label: "इलेक्ट्रिक टील (Teal & Emerald)", value: "from-emerald-950 via-teal-900 to-slate-900" },
    { label: "सनसेट एम्बर (Sunset Amber)", value: "from-amber-600 via-orange-600 to-red-900" },
    { label: "रॉयल पर्पल (Royal Purple)", value: "from-purple-950 via-indigo-950 to-slate-950" },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100">
      <AdminNav />

      <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
                <Megaphone className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                Marketing & Promotion Engine
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              प्रमोशनल बैनर एवं अभियान प्रबंधक
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              वेबसाइट पर विज्ञापन, विशेष घोषणाएं, ऐप इंस्टालर और इन-आर्टिकल प्रचार सीधे प्रबंधित करें।
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#c61d23] hover:bg-[#a8161b] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-900/30 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>नया प्रचार अभियान बनाएं</span>
          </button>
        </div>

        {/* Campaign Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((b) => {
            const ctr =
              b.stats.impressions > 0
                ? ((b.stats.clicks / b.stats.impressions) * 100).toFixed(1)
                : "0.0";

            return (
              <div
                key={b._id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded bg-red-950/60 text-red-400 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                      {b.type.replace(/_/g, " ")}
                    </span>
                    <button
                      onClick={() => handleToggleActive(b)}
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase transition-colors cursor-pointer ${
                        b.isActive
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {b.isActive ? "● सक्रिय (Active)" : "निष्क्रिय (Paused)"}
                    </button>
                  </div>

                  {/* Banner Mini Preview */}
                  <div
                    className={`rounded-xl bg-gradient-to-r ${b.bgGradient} p-3.5 text-white shadow-inner mb-3`}
                  >
                    <h4 className="text-xs font-bold leading-tight line-clamp-1">{b.title}</h4>
                    {b.subtitle && (
                      <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{b.subtitle}</p>
                    )}
                    <div className="mt-2 text-right">
                      <span className="inline-block rounded bg-white text-black px-2 py-0.5 text-[9px] font-black">
                        {b.ctaText || "Click"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-white mb-1">{b.name}</h3>
                  <div className="text-[10px] text-slate-400 truncate">URL: {b.ctaUrl}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>👀 {b.stats.impressions}</span>
                    <span>👆 {b.stats.clicks}</span>
                    <span className="text-emerald-400 font-mono font-bold">{ctr}% CTR</span>
                  </div>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Create Campaign */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in"
            onClick={() => setModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-slate-900 p-6 lg:p-8 shadow-2xl"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-bold text-white mb-1">नया प्रचार अभियान बनाएं</h2>
              <p className="text-xs text-slate-400 mb-6">
                बैनर का स्थान, थीम और संदेश निर्धारित करें।
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      अभियान का नाम (Campaign Name)*
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="उदा: Android App Download Banner"
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      बैनर का स्थान (Placement Type)*
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    >
                      <option value="announcement_strip">शीर्ष घोषणा पट्टी (Top Strip)</option>
                      <option value="sticky_bottom_mobile">मोबाइल बॉटम स्टिकी (Sticky Bottom)</option>
                      <option value="hero">होमपेज हीरो बैनर (Hero Placement)</option>
                      <option value="in_article">लेख के बीच (In-Article)</option>
                      <option value="sidebar">साइडबार प्रोमो (Sidebar)</option>
                      <option value="app_install">ऐप इंस्टाल प्रोमो (App Install)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      मुख्य शीर्षक (Title)*
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="भारत पल्स न्यूज़ ऐप अभी डाउनलोड करें!"
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      उप-शीर्षक (Subtitle / Description)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="24 घंटे निष्पक्ष और सटीक खबरें सीधे अपनी हथेली पर"
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      बटन टेक्स्ट (CTA Text)
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="अभी इंस्टॉल करें →"
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      डेस्टिनेशन URL (Target Link)*
                    </label>
                    <input
                      type="text"
                      required
                      value={ctaUrl}
                      onChange={(e) => setCtaUrl(e.target.value)}
                      placeholder="https://play.google.com/..."
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Color Preset Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    रंग थीम (Background Gradient)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {gradientPresets.map((g) => (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => setBgGradient(g.value)}
                        className={`rounded-xl p-2.5 text-center text-[10px] font-bold text-white transition-all cursor-pointer bg-gradient-to-r ${g.value} ${
                          bgGradient === g.value ? "ring-2 ring-white" : "opacity-80 hover:opacity-100"
                        }`}
                      >
                        {g.label.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="rounded-2xl border border-white/15 bg-black/40 p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    लाइव प्रीव्यू (Live Banner Preview):
                  </span>
                  <div
                    className={`rounded-xl bg-gradient-to-r ${bgGradient} p-4 text-white shadow-lg flex items-center justify-between gap-4`}
                  >
                    <div>
                      <h4 className="text-sm font-black">{title || "बैनर शीर्षक यहाँ दिखाई देगा..."}</h4>
                      <p className="text-xs text-white/80 mt-0.5">{subtitle || "संक्षिप्त विवरण यहाँ होगा..."}</p>
                    </div>
                    <span className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-black shrink-0 shadow">
                      {ctaText || "Click"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-[#c61d23] hover:bg-[#a8161b] px-6 py-2 text-xs font-bold text-white shadow cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? "सहेजा जा रहा है..." : "अभियान सुरक्षित करें"}
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

