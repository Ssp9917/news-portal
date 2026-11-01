"use client";

import { useState, useRef } from "react";
import {
  UploadCloud,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface CloudinaryImageUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  caption?: string;
  onCaptionChange?: (caption: string) => void;
  titleSuggestion?: string;
}

export default function CloudinaryImageUploader({
  label = "Featured Image (मुख्य छवि)",
  value,
  onChange,
  caption = "",
  onCaptionChange,
  titleSuggestion = "",
}: CloudinaryImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [tempUrl, setTempUrl] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Check size limit: 15MB
    if (file.size > 15 * 1024 * 1024) {
      setError("Image size exceeds 15MB limit.");
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");
      if (titleSuggestion) {
        formData.append("altText", `${titleSuggestion} | भारत पल्स (Bharat Pulse)`);
      }

      setUploadProgress(45);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(80);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload to Cloudinary");
      }

      if (data.url) {
        setUploadProgress(100);
        onChange(data.url);
        setTempUrl(data.url);
      } else {
        throw new Error("No URL returned from server");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileUpload(file);
    }
  };

  const handleApplyUrl = () => {
    if (tempUrl && tempUrl.trim()) {
      onChange(tempUrl.trim());
      setError(null);
    }
  };

  const handleClear = () => {
    onChange("");
    setTempUrl("");
    setError(null);
  };

  const isCloudinary = value.includes("cloudinary.com");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {label}
        </label>
        {value && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isCloudinary
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
            }`}
          >
            {isCloudinary ? "☁️ Cloudinary WebP" : "🔗 External Link"}
          </span>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex rounded-xl bg-slate-900/90 p-1 border border-white/10">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
            activeTab === "upload"
              ? "bg-[#c61d23] text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UploadCloud className="h-3.5 w-3.5" />
          <span>Upload Image (Cloudinary)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
            activeTab === "url"
              ? "bg-[#c61d23] text-white shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          <span>Paste Image URL</span>
        </button>
      </div>

      {/* Tab 1: Upload to Cloudinary */}
      {activeTab === "upload" && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
            dragOver
              ? "border-[#c61d23] bg-red-950/20"
              : "border-white/15 bg-slate-900/40 hover:border-white/30 hover:bg-slate-900/70"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
              e.target.value = "";
            }}
            className="hidden"
          />

          {uploading ? (
            <div className="space-y-3 py-2 w-full max-w-xs">
              <RefreshCw className="h-7 w-7 text-red-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-white">
                Uploading to Cloudinary CDN...
              </p>
              {uploadProgress !== null && (
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600/15 text-red-400 border border-red-500/25">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  Click to browse or drag & drop image
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Direct upload to Cloudinary • Auto-converted to WebP (JPG, PNG, WEBP, AVIF up to 15MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Paste Image URL */}
      {activeTab === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
              className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="rounded-xl bg-[#c61d23] hover:bg-[#a8161b] px-4 py-2.5 text-xs font-bold text-white transition-all shadow"
            >
              Apply
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Paste any existing public image link or Unsplash / CDN photo URL.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 px-3 py-2 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Preview Card */}
      {value && (
        <div className="rounded-2xl border border-white/15 bg-slate-900/80 p-3.5 backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Active Image Preview</span>
            </span>
            <div className="flex items-center gap-2">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
                title="Open full size"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <button
                type="button"
                onClick={handleClear}
                className="text-red-400 hover:text-red-300 transition-colors"
                title="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Aspect Ratio Container */}
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-950 border border-white/10">
            <img
              src={value}
              alt={caption || titleSuggestion || "Article preview"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="text-[11px] text-slate-400 font-mono truncate" title={value}>
            URL: {value}
          </div>
        </div>
      )}

      {/* Caption & Photo Credit */}
      {onCaptionChange && (
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-slate-400">
            Image Caption & Credit (कैप्शन व फोटो साभार)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            placeholder="संसद भवन के बाहर प्रेस वार्ता (फोटो: पीटीआई/एएनआई)"
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
