// app/admin/edit/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, ChevronDown } from "lucide-react";
import { ADMIN_NEWS_CATEGORIES } from "@/lib/admin-categories";
import MediaUpload from "../../../components/admin/Mediaupload";

// ── Shared sub-components (same as add page) ──────────────────────────────────
function Section({ title, children, badge }: {
  title: string;
  children: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h3 className="text-sm font-bold tracking-tight text-gray-900">{title}</h3>
        {badge && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-500">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function I18nField({ label, name, value, onChange, rows = 3, isTextarea = false }: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  rows?: number;
  isTextarea?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasValue = value.trim().length > 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <span className={`h-1.5 w-1.5 rounded-full ${hasValue ? "bg-green-400" : "bg-gray-300"}`} />
          {label}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3">
          {isTextarea ? (
            <textarea
              name={name}
              value={value}
              onChange={onChange}
              rows={rows}
              className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <input
              type="text"
              name={name}
              value={value}
              onChange={onChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          )}
        </div>
      )}
    </div>
  );
}

function Toggle({ name, checked, onChange, label, description, accent = "blue" }: {
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  description?: string;
  accent?: "blue" | "red";
}) {
  const colors = {
    blue: "peer-checked:bg-blue-500 peer-focus:ring-blue-200",
    red: "peer-checked:bg-red-500 peer-focus:ring-red-200",
  };
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
        <div className={`relative h-6 w-11 rounded-full bg-gray-200 transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-2 ${colors[accent]}`} />
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function EditNewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({
    title: "", titleI18nEn: "", titleI18nHi: "",
    slug: "",
    excerpt: "", excerptI18nEn: "", excerptI18nHi: "",
    content: "", contentI18nEn: "", contentI18nHi: "",
    category: "", author: "", image: "",
    isBreaking: false, published: false,
    tags: "", gallery: [] as string[], videoUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const slugify = (text: string) =>
    text.toLowerCase().trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0980-\u09FF-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "");

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/admin"); return; }

    (async () => {
      try {
        const res = await fetch(`/api/news/${id}`);
        if (!res.ok) throw new Error("Not found");
        const data = await res.json();
        setFormData({
          title: data.title ?? "",
          titleI18nEn: data.titleI18n?.en ?? "",
          titleI18nHi: data.titleI18n?.hi ?? "",
          slug: data.slug ?? slugify(data.title ?? ""),
          excerpt: data.excerpt ?? "",
          excerptI18nEn: data.excerptI18n?.en ?? "",
          excerptI18nHi: data.excerptI18n?.hi ?? "",
          content: data.content ?? data.excerpt ?? "",
          contentI18nEn: data.contentI18n?.en ?? "",
          contentI18nHi: data.contentI18n?.hi ?? "",
          category: data.category ?? "বিশ্ব",
          author: data.author ?? "Admin",
          image: data.image ?? "",
          isBreaking: data.isBreaking ?? false,
          published: data.published ?? true,
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
          videoUrl: data.videoUrl ?? "",
        });
      } catch {
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);

    const selectedCat = ADMIN_NEWS_CATEGORIES.find((c) => c.value === formData.category);
    const categoryColor = selectedCat?.color ?? "bg-gray-500";

    try {
      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          titleI18n: { en: formData.titleI18nEn, hi: formData.titleI18nHi },
          slug: formData.slug,
          excerpt: formData.excerpt,
          excerptI18n: { en: formData.excerptI18nEn, hi: formData.excerptI18nHi },
          content: formData.content,
          contentI18n: { en: formData.contentI18nEn, hi: formData.contentI18nHi },
          category: formData.category,
          author: formData.author,
          image: formData.image,
          isBreaking: formData.isBreaking,
          published: formData.published,
          videoUrl: formData.videoUrl,
          categoryColor,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
          gallery: formData.gallery.filter((u) => u.trim()),
        }),
      });

      if (res.ok) router.push("/admin/dashboard");
      else alert("Could not save changes");
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center gap-3">
      <svg className="h-5 w-5 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span className="text-sm text-gray-500">Loading article…</span>
    </div>
  );

  if (error || !id) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-red-500">{error || "No article ID provided."}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb] pb-24 text-gray-900" style={{ fontFamily: "Georgia, serif" }}>

      {/* ── Sticky nav ── */}
      <nav className="sticky top-0 z-20 border-b border-gray-200/80 bg-white/90 px-4 py-3 backdrop-blur-md md:px-6">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/dashboard"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-5 w-px bg-gray-200" />
            <h1 className="text-base font-bold text-gray-900 md:text-lg">Edit Article</h1>
            <span className="hidden rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 sm:inline">
              Editing
            </span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:opacity-50"
          >
            {saving ? (
              <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>Saving…</>
            ) : (
              <><Save className="h-4 w-4" /><span>Update</span></>
            )}
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-5 lg:gap-7">

          {/* LEFT */}
          <div className="col-span-12 space-y-5 lg:col-span-8">
            <Section title="Headline">
              <textarea name="title" value={formData.title} onChange={handleChange} rows={2}
                placeholder="Write a compelling headline…"
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-xl font-bold leading-snug outline-none transition placeholder:font-normal placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required />
              <div className="mt-3 flex items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 text-sm">
                <span className="select-none border-r border-gray-200 bg-gray-100 px-3 py-2.5 text-xs text-gray-400 whitespace-nowrap">/news/</span>
                <input type="text" name="slug" value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: slugify(e.target.value) }))}
                  placeholder="url-slug"
                  className="flex-1 bg-transparent px-3 py-2.5 text-gray-600 outline-none" />
              </div>
              <div className="mt-3 space-y-2">
                <I18nField label="Title in English" name="titleI18nEn" value={formData.titleI18nEn} onChange={handleChange} />
                <I18nField label="Title in Hindi (हिन्दी)" name="titleI18nHi" value={formData.titleI18nHi} onChange={handleChange} />
              </div>
            </Section>

            <Section title="Excerpt / Summary" badge="required">
              <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3}
                placeholder="Short summary…"
                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-relaxed outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required />
              <div className="mt-3 space-y-2">
                <I18nField label="Excerpt in English" name="excerptI18nEn" value={formData.excerptI18nEn} onChange={handleChange} isTextarea rows={3} />
                <I18nField label="Excerpt in Hindi (हिन्दी)" name="excerptI18nHi" value={formData.excerptI18nHi} onChange={handleChange} isTextarea rows={3} />
              </div>
            </Section>

            <Section title="Full Article (HTML)" badge="required">
              <textarea name="content" value={formData.content} onChange={handleChange} rows={16}
                placeholder="<p>Full article HTML…</p>"
                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm leading-relaxed outline-none transition placeholder:font-sans placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required />
              <div className="mt-3 space-y-2">
                <I18nField label="Full article in English (HTML)" name="contentI18nEn" value={formData.contentI18nEn} onChange={handleChange} isTextarea rows={10} />
                <I18nField label="Full article in Hindi (HTML)" name="contentI18nHi" value={formData.contentI18nHi} onChange={handleChange} isTextarea rows={10} />
              </div>
            </Section>
          </div>

          {/* RIGHT */}
          <div className="col-span-12 space-y-5 lg:col-span-4">
            <Section title="Publishing">
              <div className="space-y-3">
                <Toggle name="published" checked={formData.published} onChange={handleChange}
                  label="Published" description="Visible to readers" accent="blue" />
                <Toggle name="isBreaking" checked={formData.isBreaking} onChange={handleChange}
                  label="Breaking News" description="Shown in breaking banner" accent="red" />
              </div>
            </Section>

            <Section title="Category">
              <div className="relative">
                <select name="category" value={formData.category} onChange={handleChange}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  {ADMIN_NEWS_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </Section>

            <Section title="Featured Image">
              <MediaUpload label="" value={formData.image}
                onChange={(url) => setFormData((p) => ({ ...p, image: url }))}
                type="image" placeholder="https://… or upload" />
            </Section>

            <Section title="Video">
              <MediaUpload label="" value={formData.videoUrl}
                onChange={(url) => setFormData((p) => ({ ...p, videoUrl: url }))}
                type="video" placeholder="YouTube URL or upload video" />
            </Section>

            <Section title="Author">
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input type="text" name="author" value={formData.author} onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
            </Section>

            <Section title="Tags">
              <input type="text" name="tags" value={formData.tags} onChange={handleChange}
                placeholder="politics, cricket, tech"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              <p className="mt-1.5 text-xs text-gray-400">Separate with commas</p>
              {formData.tags && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {formData.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{tag}</span>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Image Gallery">
              <div className="space-y-2.5">
                {formData.gallery.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={url}
                      onChange={(e) => {
                        const g = [...formData.gallery];
                        g[i] = e.target.value;
                        setFormData((p) => ({ ...p, gallery: g }));
                      }}
                      placeholder={`Image URL ${i + 1}`}
                      className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                    <button type="button"
                      onClick={() => setFormData((p) => ({ ...p, gallery: p.gallery.filter((_, j) => j !== i) }))}
                      className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button type="button"
                  onClick={() => setFormData((p) => ({ ...p, gallery: [...p.gallery, ""] }))}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-2.5 text-xs font-semibold text-gray-400 transition hover:border-blue-300 hover:text-blue-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add image URL
                </button>
              </div>
            </Section>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditNewsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center gap-3">
        <svg className="h-5 w-5 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-gray-500">Loading…</span>
      </div>
    }>
      <EditNewsContent />
    </Suspense>
  );
}