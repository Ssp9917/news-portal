"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Sparkles,
  Zap,
  Flame,
  SearchCode,
  CheckCircle2,
  Clock,
  Trash2,
  ExternalLink,
} from "lucide-react";

function EditNewsForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [categories, setCategories] = useState<{ name: string; slug: string; color?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
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
    author: "",
    authorBio: "",
    date: "",
    image: "",
    imageCaption: "",
    imageCredit: "",
    isBreaking: false,
    isFeatured: false,
    isTrending: false,
    isEditorPick: false,
    published: true,
    videoUrl: "",
    tags: "",
    readingTime: 3,
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

    if (!id) {
      router.push("/admin/dashboard");
      return;
    }

    // Fetch categories and article
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch(`/api/news/${id}`).then((r) => r.json()),
    ])
      .then(([catData, newsData]) => {
        if (Array.isArray(catData)) setCategories(catData);
        if (newsData && !newsData.error) {
          setFormData({
            title: newsData.title || "",
            titleI18n: newsData.titleI18n || { hi: "", en: "", bn: "" },
            subtitle: newsData.subtitle || "",
            subtitleI18n: newsData.subtitleI18n || { hi: "", en: "", bn: "" },
            slug: newsData.slug || "",
            category: newsData.category || "",
            categoryColor: newsData.categoryColor || "bg-blue-600",
            excerpt: newsData.excerpt || "",
            excerptI18n: newsData.excerptI18n || { hi: "", en: "", bn: "" },
            content: newsData.content || "",
            contentI18n: newsData.contentI18n || { hi: "", en: "", bn: "" },
            author: newsData.author || "",
            authorBio: newsData.authorBio || "",
            date: newsData.date || "",
            image: newsData.image || "",
            imageCaption: newsData.imageCaption || "",
            imageCredit: newsData.imageCredit || "",
            isBreaking: Boolean(newsData.isBreaking),
            isFeatured: Boolean(newsData.isFeatured),
            isTrending: Boolean(newsData.isTrending),
            isEditorPick: Boolean(newsData.isEditorPick),
            published: newsData.published !== false,
            videoUrl: newsData.videoUrl || "",
            tags: Array.isArray(newsData.tags) ? newsData.tags.join(", ") : "",
            readingTime: newsData.readingTime || 3,
            seo: newsData.seo || {
              title: "",
              description: "",
              focusKeyword: "",
              canonicalUrl: "",
              ogImage: "",
              noIndex: false,
            },
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setFetching(false));
  }, [id, router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleContentChange = (contentVal: string) => {
    const plainWords = contentVal.replace(/<[^>]*>/g, "").trim().split(/\s+/).length;
    const estimatedMinutes = Math.max(1, Math.ceil(plainWords / 180));
    setFormData((prev) => ({
      ...prev,
      content: contentVal,
      readingTime: estimatedMinutes,
    }));
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
      };

      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Article updated successfully!");
        setTimeout(() => router.push("/admin/dashboard"), 1200);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update article");
      }
    } catch {
      alert("Network error updating article");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070b14] text-slate-400">
        <p>Loading article data...</p>
      </div>
    );
  }

  const effectiveSeoTitle = formData.seo?.title || formData.title;
  const effectiveSeoDesc = formData.seo?.description || formData.excerpt;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 lg:p-8">
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-950/90 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-blue-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="mx-auto max-w-6xl mb-6 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href={`/hi/news/${formData.slug || id}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>View Live</span>
          </Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Updating..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-6xl grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: 8 cols */}
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Primary Headline (Hindi) *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-lg font-bold text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Subtitle / Secondary Deck
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2 text-sm text-slate-200"
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">/news/</span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 font-mono text-xs text-white"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Editorial Excerpt *
            </label>
            <textarea
              rows={3}
              required
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-200"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Body Content *
              </label>
              <span className="font-mono text-xs text-blue-400">
                ~{formData.readingTime} min read
              </span>
            </div>
            <textarea
              rows={14}
              required
              value={formData.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-200"
            />
          </div>
        </div>

        {/* Right Column: 4 cols */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Beat & Classification
            </h3>

            <div>
              <label className="mb-1 block font-semibold text-slate-400">Category *</label>
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
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-white"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-400">Byline / Author</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-1 block font-semibold text-slate-400">Topic Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl space-y-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Editorial Status
            </h3>

            <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 cursor-pointer">
              <span className="flex items-center gap-2 font-semibold text-white">
                <Sparkles className="h-4 w-4 text-blue-400" /> Featured Story
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
                <Zap className="h-4 w-4 text-red-400" /> Breaking News Ticker
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
                <Flame className="h-4 w-4 text-amber-400" /> Trending Story
              </span>
              <input
                type="checkbox"
                checked={formData.isTrending}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                className="rounded accent-amber-600 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-lg bg-white/5 cursor-pointer">
              <span className="font-semibold text-white">Published Status</span>
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded accent-emerald-600 h-4 w-4"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl space-y-4 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Media & Video
            </h3>
            <div>
              <label className="mb-1 block font-semibold text-slate-400">Featured Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-mono text-white"
              />
            </div>
            <div>
              <label className="mb-1 block font-semibold text-slate-400">Video Embed URL</label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-mono text-white"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function EditNewsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading editor...</div>}>
      <EditNewsForm />
    </Suspense>
  );
}
