"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type { Role } from "@/lib/auth/rbac";

interface MediaItem {
  _id: string;
  name: string;
  url: string;
  format?: string;
  size?: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  credit?: string;
  createdAt: string;
}

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
    fetchMedia();
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

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/admin/media");
      if (res.ok) {
        const data = await res.json();
        setMediaList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Upload to Cloudinary via existing /api/upload
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload to cloud storage failed");
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.secure_url || uploadData.url;

      // Step 2: Record in Media Library
      const token = localStorage.getItem("admin_token");
      const mediaRecord = {
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: imageUrl,
        format: file.type.split("/")[1] || "jpeg",
        size: file.size,
        altText: file.name.replace(/\.[^/.]+$/, ""),
        caption: "",
        credit: "Daily Latest News",
      };

      const recordRes = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mediaRecord),
      });

      if (recordRes.ok) {
        showToast("Image uploaded and added to Media Library!");
        fetchMedia();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      showToast(msg);
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast("Image URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast("Image deleted");
        setMediaList(mediaList.filter((m) => m._id !== id));
        if (selectedMedia?._id === id) setSelectedMedia(null);
      }
    } catch {
      showToast("Error deleting image");
    }
  };

  const filtered = mediaList.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.altText && m.altText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
                <ImageIcon className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Media & Asset Library
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Upload, optimize, tag, and copy URLs for articles, hero banners, and social open graph cards.
            </p>
          </div>

          <label className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] cursor-pointer transition-all">
            <UploadCloud className="h-4 w-4" />
            <span>{uploading ? "Uploading..." : "Upload New Image"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Search & Statistics */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search images by name or alt text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none backdrop-blur-md"
            />
          </div>

          <span className="text-xs text-slate-400">
            Total Assets: <strong className="text-white font-mono">{mediaList.length}</strong>
          </span>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filtered.map((item) => (
            <div
              key={item._id}
              onClick={() => setSelectedMedia(item)}
              className={`group relative overflow-hidden rounded-xl border p-2 cursor-pointer transition-all ${
                selectedMedia?._id === item._id
                  ? "border-blue-500 bg-blue-950/40 shadow-xl shadow-blue-500/20"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-900">
                <img
                  src={item.url}
                  alt={item.altText || item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="mt-2">
                <p className="truncate text-xs font-semibold text-white">{item.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-mono">
                  {item.format || "image"}
                </p>
              </div>

              {/* Hover Quick Actions */}
              <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyUrl(item.url, item._id);
                  }}
                  title="Copy URL"
                  className="rounded-md bg-black/70 p-1.5 text-white hover:bg-blue-600 transition-colors shadow backdrop-blur-sm"
                >
                  {copiedId === item._id ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item._id);
                  }}
                  title="Delete"
                  className="rounded-md bg-black/70 p-1.5 text-white hover:bg-red-600 transition-colors shadow backdrop-blur-sm"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Media Drawer/Card */}
        {selectedMedia && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <h3 className="text-base font-bold text-white">{selectedMedia.name}</h3>
                <p className="font-mono text-slate-400 break-all">{selectedMedia.url}</p>
                <div className="flex flex-wrap items-center gap-4 text-slate-300 pt-1">
                  <span>
                    Format: <strong className="text-white uppercase">{selectedMedia.format}</strong>
                  </span>
                  <span>
                    Size:{" "}
                    <strong className="text-white">
                      {selectedMedia.size
                        ? `${Math.round(selectedMedia.size / 1024)} KB`
                        : "Optimized"}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    onClick={() => copyUrl(selectedMedia.url, selectedMedia._id)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-500"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy CDN URL</span>
                  </button>
                  <a
                    href={selectedMedia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-300 hover:bg-white/10"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open High-Res</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
