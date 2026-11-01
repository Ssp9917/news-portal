"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Zap,
  Flame,
  SearchCode,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Eye,
  Layers,
  HelpCircle,
  MapPin,
} from "lucide-react";
import MediaUpload from "@/components/admin/Mediaupload";
import { POPULAR_INDIAN_CITIES } from "@/lib/location";

export default function AddNewsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<{ name: string; slug: string; color?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    titleI18n: { hi: "", en: "", bn: "" },
    subtitle: "",
    subtitleI18n: { hi: "", en: "", bn: "" },
    slug: "",
    category: "",
    categoryColor: "bg-blue-600",
    excerpt: "",
    excerptI18n: { hi: "", en: "", bn: "" },
    content: "",
    contentI18n: { hi: "", en: "", bn: "" },
    author: "Editorial Team",
    authorBio: "Senior Investigative Journalist & Chief Reporter",
    date: new Date().toLocaleDateString("hi-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    image: "",
    imageCaption: "",
    imageCredit: "Daily Latest News",
    isBreaking: false,
    isFeatured: false,
    isTrending: false,
    isEditorPick: false,
    published: true,
    videoUrl: "",
    tags: "",
    readingTime: 3,
    location: {
      city: "",
      district: "",
      state: "",
      pinCode: "",
      level: "national",
    },
    seo: {
      title: "",
      description: "",
      focusKeyword: "",
      canonicalUrl: "",
      ogImage: "",
      noIndex: false,
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    // Fetch categories
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
          setFormData((prev) => ({
            ...prev,
            category: prev.category || data[0].name,
            categoryColor: data[0].color || "bg-blue-600",
          }));
        }
      })
      .catch(() => {});
  }, [router]);

  // Auto generate slug from title
  const generateSlug = () => {
    if (!formData.title) return;
    const clean = formData.title
      .trim()
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, slug: `${clean}-${randomSuffix}` }));
  };

  // Recalculate reading time on content change
  const handleContentChange = (contentVal: string) => {
    const plainWords = contentVal.replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
    const estimatedMinutes = Math.max(1, Math.ceil(plainWords / 180));
    setFormData((prev) => ({
      ...prev,
      content: contentVal,
      readingTime: estimatedMinutes,
    }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert("Title and content are required.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      const tagsArray = formData.tags
        ? formData.tags.split(",").map((t) => t.trim().replace(/^#/, "")).filter(Boolean)
        : [];

      const payload = {
        ...formData,
        tags: tagsArray,
        titleI18n: {
          ...formData.titleI18n,
          hi: formData.titleI18n.hi || formData.title,
        },
        excerptI18n: {
          ...formData.excerptI18n,
          hi: formData.excerptI18n.hi || formData.excerpt,
        },
        contentI18n: {
          ...formData.contentI18n,
          hi: formData.contentI18n.hi || formData.content,
        },
      };

      const res = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Article published successfully!");
        setTimeout(() => router.push("/admin/dashboard"), 1200);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create article");
      }
    } catch {
      alert("Network error creating article");
    } finally {
      setLoading(false);
    }
  };

  // SEO Scores
  const effectiveSeoTitle = formData.seo.title || formData.title;
  const effectiveSeoDesc = formData.seo.description || formData.excerpt;
  const titleLength = effectiveSeoTitle.length;
  const descLength = effectiveSeoDesc.length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 lg:p-8">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-950/90 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="mx-auto max-w-6xl mb-6 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, published: false })}
            className={`rounded-xl border px-4 py-2 text-xs font-semibold transition-all ${
              !formData.published
                ? "border-amber-500/40 bg-amber-500/20 text-amber-300"
                : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            Draft Mode
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Publishing..." : "Publish Article"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Editorial Content (8 cols) */}
        <div className="space-y-6 lg:col-span-8">
          {/* Main Headline */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Primary Headline (Hindi) *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="संसद का शीतकालीन सत्र: देश में AI और अर्थव्यवस्था पर बड़ा फैसला"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-lg font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />

            {/* Subtitle */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Subtitle / Secondary Deck
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="विपक्ष ने उठाए महंगाई पर सवाल, वित्त मंत्री ने पेश किए विकास दर के नए आंकड़े"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* URL Slug Generator */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">/news/</span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="parliament-winter-session-2026"
                className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 font-mono text-xs text-white focus:border-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={generateSlug}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                Auto Generate
              </button>
            </div>
          </div>

          {/* Excerpt */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Editorial Excerpt / Lead Summary *
            </label>
            <textarea
              rows={3}
              required
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="नई दिल्ली। संसद के शीतकालीन सत्र का पहला दिन हंगामेदार रहा..."
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Full Rich Article Content */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Article Body Content (Supports HTML / Formatted Text) *
              </label>
              <span className="flex items-center gap-1 font-mono text-xs text-blue-400">
                <Clock className="h-3.5 w-3.5" />
                ~{formData.readingTime} min read
              </span>
            </div>

            {/* Quick Formatting Helpers */}
            <div className="mb-2 flex flex-wrap gap-1.5 p-1 rounded-lg bg-slate-900/60 border border-white/5 text-xs text-slate-300">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    content: prev.content + "\n<h2>Subheading</h2>\n",
                  }))
                }
                className="px-2 py-1 hover:bg-white/10 rounded"
              >
                H2 Heading
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    content: prev.content + "\n<h3>Section Subhead</h3>\n",
                  }))
                }
                className="px-2 py-1 hover:bg-white/10 rounded"
              >
                H3 Heading
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    content: prev.content + "\n<p>Your paragraph text here...</p>\n",
                  }))
                }
                className="px-2 py-1 hover:bg-white/10 rounded"
              >
                Paragraph
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    content:
                      prev.content +
                      "\n<blockquote class='border-l-4 border-blue-500 pl-4 italic text-slate-300'>Important quote here...</blockquote>\n",
                  }))
                }
                className="px-2 py-1 hover:bg-white/10 rounded"
              >
                Blockquote
              </button>
            </div>

            <textarea
              rows={12}
              required
              value={formData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="<p>पहला पैराग्राफ...</p>"
              className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Multilingual Support (English & Bangla titles) */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Multilingual Translations (Optional)
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  English Headline
                </label>
                <input
                  type="text"
                  value={formData.titleI18n.en || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      titleI18n: { ...formData.titleI18n, en: e.target.value },
                    })
                  }
                  placeholder="Parliament Winter Session..."
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Bangla Headline
                </label>
                <input
                  type="text"
                  value={formData.titleI18n.bn || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      titleI18n: { ...formData.titleI18n, bn: e.target.value },
                    })
                  }
                  placeholder="সংসদের শীতকালীন অধিবেশন..."
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata, Featured, SEO (4 cols) */}
        <div className="space-y-6 lg:col-span-4">
          {/* Category & Status */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Beat & Classification
            </h3>

            <div>
              <label className="mb-1 block font-semibold text-slate-400">
                News Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => {
                  const sel = categories.find((c) => c.name === e.target.value);
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    categoryColor: sel?.color || "bg-blue-600",
                  });
                }}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-400">
                Byline / Author Name
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-400">
                Topic Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="संसद, राजनीति, अर्थव्यवस्था"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* Location & Local News Tagging */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-red-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Location & Local News (स्थान / शहर)
              </h3>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-400">
                Coverage Scope
              </label>
              <select
                value={formData.location.level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { ...formData.location, level: e.target.value as any },
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
              >
                <option value="national">National (राष्ट्रीय - पूरे देश के लिए)</option>
                <option value="state">State (राज्य स्तरीय)</option>
                <option value="city">City / Local (शहर / स्थानीय न्यूज़)</option>
                <option value="hyperlocal">Hyperlocal (वार्ड / मोहल्ला)</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-400">
                Quick City Select (त्वरित शहर चयन)
              </label>
              <select
                onChange={(e) => {
                  const city = POPULAR_INDIAN_CITIES.find((c) => c.name === e.target.value);
                  if (city) {
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        city: city.name,
                        state: city.state,
                        level: "city",
                      },
                    });
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
              >
                <option value="">-- Choose Indian City --</option>
                {POPULAR_INDIAN_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.nameHi} ({c.name}) — {c.stateHi}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block font-semibold text-slate-400">City Name</label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, city: e.target.value },
                    })
                  }
                  placeholder="e.g. Jaipur"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-1 block font-semibold text-slate-400">State Name</label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, state: e.target.value },
                    })
                  }
                  placeholder="e.g. Rajasthan"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Editorial Display Toggles */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Editorial Promotion
            </h3>

            <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 cursor-pointer">
              <span className="flex items-center gap-2 font-semibold text-white">
                <Sparkles className="h-4 w-4 text-blue-400" />
                Featured Story (Hero)
              </span>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded accent-blue-600 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 cursor-pointer">
              <span className="flex items-center gap-2 font-semibold text-white">
                <Zap className="h-4 w-4 text-red-400" />
                Breaking News Ticker
              </span>
              <input
                type="checkbox"
                checked={formData.isBreaking}
                onChange={(e) => setFormData({ ...formData, isBreaking: e.target.checked })}
                className="rounded accent-red-600 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 cursor-pointer">
              <span className="flex items-center gap-2 font-semibold text-white">
                <Flame className="h-4 w-4 text-amber-400" />
                Trending Spotlight
              </span>
              <input
                type="checkbox"
                checked={formData.isTrending}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                className="rounded accent-amber-600 h-4 w-4"
              />
            </label>
          </div>

          {/* Featured Image & Video */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Media & Video
            </h3>

            <div>
              <label className="mb-1 block font-semibold text-slate-400">
                Featured Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-mono text-white"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-400">
                Image Caption & Credit
              </label>
              <input
                type="text"
                value={formData.imageCaption}
                onChange={(e) => setFormData({ ...formData, imageCaption: e.target.value })}
                placeholder="संसद भवन के बाहर प्रेस कॉन्फ्रेंस (फोटो: पीटीआई)"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-400">
                Video URL (YouTube Embed)
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-mono text-white"
              />
            </div>
          </div>

          {/* In-Editor Real-Time SEO Analyzer */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-white">
                <SearchCode className="h-4 w-4 text-cyan-400" />
                <span>SEO Snippet Analyzer</span>
              </h3>
            </div>

            <div>
              <label className="mb-1 flex items-center justify-between font-semibold text-slate-400">
                <span>Custom SEO Meta Title</span>
                <span
                  className={`font-mono text-[10px] ${
                    titleLength >= 40 && titleLength <= 65
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {titleLength}/60 chars
                </span>
              </label>
              <input
                type="text"
                value={formData.seo.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, title: e.target.value },
                  })
                }
                placeholder="Leave blank to use main headline"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center justify-between font-semibold text-slate-400">
                <span>SEO Meta Description</span>
                <span
                  className={`font-mono text-[10px] ${
                    descLength >= 120 && descLength <= 160
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}
                >
                  {descLength}/160 chars
                </span>
              </label>
              <textarea
                rows={2}
                value={formData.seo.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    seo: { ...formData.seo, description: e.target.value },
                  })
                }
                placeholder="Leave blank to use excerpt"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
              />
            </div>

            {/* Google SERP Live Simulation */}
            <div className="rounded-xl border border-white/10 bg-slate-950 p-3 text-left">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                Google Search Result Preview
              </span>
              <div className="text-[11px] text-[#202124] dark:text-[#bdc1c6] truncate">
                https://dailylatestnews.in/news/{formData.slug || "slug-here"}
              </div>
              <h5 className="text-xs font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline line-clamp-1 mt-0.5">
                {effectiveSeoTitle || "Article Headline Will Appear Here"}
              </h5>
              <p className="text-[11px] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 mt-0.5">
                {effectiveSeoDesc || "Article description preview on Google search engine."}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
