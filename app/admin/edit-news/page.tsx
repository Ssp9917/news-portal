"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Save } from "lucide-react";
import { ADMIN_NEWS_CATEGORIES } from "@/lib/admin-categories";

function EditNewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({
    title: "",
    titleI18nEn: "",
    titleI18nHi: "",
    slug: "",
    excerpt: "",
    excerptI18nEn: "",
    excerptI18nHi: "",
    content: "",
    contentI18nEn: "",
    contentI18nHi: "",
    category: "",
    author: "",
    image: "",
    isBreaking: false,
    published: false,
    tags: "",
    gallery: [] as string[],
    videoUrl: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\u0980-\u09FF\-]/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+|-+$/g, "");

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    const fetchNews = async () => {
      try {
        const res = await fetch(`/api/news/${id}`);
        if (!res.ok) throw new Error("Failed to fetch article");
        const data = await res.json();

        setFormData({
          title: data.title || "",
          titleI18nEn: data.titleI18n?.en || "",
          titleI18nHi: data.titleI18n?.hi || "",
          slug: data.slug || slugify(data.title || ""),
          excerpt: data.excerpt || "",
          excerptI18nEn: data.excerptI18n?.en || "",
          excerptI18nHi: data.excerptI18n?.hi || "",
          content: data.content || data.excerpt || "",
          contentI18nEn: data.contentI18n?.en || "",
          contentI18nHi: data.contentI18n?.hi || "",
          category: data.category || "বিশ্ব",
          author: data.author || "Admin",
          image: data.image || "",
          isBreaking: data.isBreaking || false,
          published: data.published !== undefined ? data.published : true,
          tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
          videoUrl: data.videoUrl || "",
        });
      } catch {
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleGalleryChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newGallery = [...prev.gallery];
      newGallery[index] = value;
      return { ...prev, gallery: newGallery };
    });
  };

  const addGalleryField = () => {
    setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, ""] }));
  };

  const removeGalleryField = (index: number) => {
    setFormData((prev) => {
      const newGallery = prev.gallery.filter((_, i) => i !== index);
      return { ...prev, gallery: newGallery };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);

    const selectedCat = ADMIN_NEWS_CATEGORIES.find(
      (c) => c.value === formData.category
    );
    const categoryColor = selectedCat?.color ?? "bg-gray-500";

    try {
      const res = await fetch(`/api/news/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          titleI18n: {
            en: formData.titleI18nEn,
            hi: formData.titleI18nHi,
          },
          slug: formData.slug,
          excerpt: formData.excerpt,
          excerptI18n: {
            en: formData.excerptI18nEn,
            hi: formData.excerptI18nHi,
          },
          content: formData.content,
          contentI18n: {
            en: formData.contentI18nEn,
            hi: formData.contentI18nHi,
          },
          category: formData.category,
          author: formData.author,
          image: formData.image,
          isBreaking: formData.isBreaking,
          published: formData.published,
          tags: formData.tags,
          gallery: formData.gallery,
          videoUrl: formData.videoUrl,
          categoryColor,
          tags: formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t),
          gallery: formData.gallery.filter((url) => url.trim() !== ""),
        }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        alert("Could not save changes");
      }
    } catch (error) {
      console.error("Error updating news:", error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-sans">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center font-sans text-red-500">
        {error}
      </div>
    );
  }

  if (!id) {
    return (
      <div className="flex min-h-screen items-center justify-center font-sans text-red-500">
        No article id provided.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-gray-900">
      <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:px-6 md:py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="mx-1 h-6 w-px bg-gray-300 md:mx-2" />
          <h1 className="text-lg font-bold text-gray-900 md:text-xl">
            Edit article
          </h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            className="hidden items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:flex md:px-4 md:text-sm"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden md:inline">Preview</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-black disabled:opacity-50 md:px-6 md:text-sm"
          >
            {saving ? (
              <>Saving…</>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Update</span>
              </>
            )}
          </button>
        </div>
      </nav>

      <div className="mx-auto w-full max-w-[1600px] overflow-x-hidden px-4 py-4 md:px-6 md:py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 lg:gap-8">
          <div className="col-span-12 space-y-6 lg:col-span-8">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Article headline"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-lg outline-none transition-all placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    name="titleI18nEn"
                    value={formData.titleI18nEn}
                    onChange={handleChange}
                    placeholder="English title (optional)"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Title (Hindi)
                  </label>
                  <input
                    type="text"
                    name="titleI18nHi"
                    value={formData.titleI18nHi}
                    onChange={handleChange}
                    placeholder="Hindi title (optional)"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                URL slug
              </label>
              <div className="flex items-center">
                <span className="select-none whitespace-nowrap rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                  /bn/news/
                </span>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleSlugChange}
                  placeholder="article-url-slug"
                  className="w-full flex-1 rounded-r-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Excerpt / summary *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                placeholder="Short summary"
                className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Excerpt (English)
                  </label>
                  <textarea
                    name="excerptI18nEn"
                    value={formData.excerptI18nEn}
                    onChange={handleChange}
                    rows={3}
                    placeholder="English excerpt (optional)"
                    className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Excerpt (Hindi)
                  </label>
                  <textarea
                    name="excerptI18nHi"
                    value={formData.excerptI18nHi}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Hindi excerpt (optional)"
                    className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Full article *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={15}
                placeholder="Full HTML content"
                className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 font-mono text-sm leading-relaxed outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="mt-4 grid grid-cols-1 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Full article (English HTML)
                  </label>
                  <textarea
                    name="contentI18nEn"
                    value={formData.contentI18nEn}
                    onChange={handleChange}
                    rows={10}
                    placeholder="English HTML content (optional)"
                    className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm leading-relaxed outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Full article (Hindi HTML)
                  </label>
                  <textarea
                    name="contentI18nHi"
                    value={formData.contentI18nHi}
                    onChange={handleChange}
                    rows={10}
                    placeholder="Hindi HTML content (optional)"
                    className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 font-mono text-sm leading-relaxed outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                HTML formatting is supported (p, headings, lists, emphasis, …).
              </p>
            </div>
          </div>

          <div className="col-span-12 space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Publishing</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Published</label>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      name="published"
                      checked={formData.published}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300" />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Breaking news</label>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      name="isBreaking"
                      checked={formData.isBreaking}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300" />
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Category</h3>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ADMIN_NEWS_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Featured image</h3>
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="Image URL"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Image gallery</h3>
              <div className="space-y-3">
                {formData.gallery.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleGalleryChange(index, e.target.value)}
                      placeholder={`Image URL ${index + 1}`}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryField(index)}
                      className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                      title="Remove"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addGalleryField}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-gray-500 transition-colors hover:border-blue-500 hover:text-blue-500"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add gallery image URL
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">
                Video (YouTube URL)
              </h3>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                placeholder="YouTube URL"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Tags</h3>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tag1, tag2, tag3"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-xs text-gray-400">Separate with commas.</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-gray-900">Author</h3>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditNewsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center font-sans">
          Loading…
        </div>
      }
    >
      <EditNewsContent />
    </Suspense>
  );
}
