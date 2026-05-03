// components/admin/MediaUpload.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type MediaType = "image" | "video";

interface MediaUploadProps {
  label: string;
  value: string; // current URL
  onChange: (url: string) => void;
  type?: MediaType;
  accept?: string;
  placeholder?: string;
  required?: boolean;
}

export default function MediaUpload({
  label,
  value,
  onChange,
  type = "image",
  accept,
  placeholder = "Paste URL or upload a file",
  required = false,
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultAccept =
    type === "video" ? "video/mp4,video/webm,video/ogg" : "image/*";
  const fileAccept = accept ?? defaultAccept;

  const uploadFile = async (file: File) => {
    setError("");
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const isVideo = type === "video";
  const hasMedia = value && value.trim() !== "";

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {/* Drop zone / preview */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !hasMedia && inputRef.current?.click()}
        className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
          hasMedia
            ? "border-gray-200 bg-gray-50"
            : dragOver
            ? "border-blue-400 bg-blue-50 cursor-copy"
            : "border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50"
        }`}
      >
        {hasMedia ? (
          /* ── Preview ── */
          <div className="relative">
            {isVideo ? (
              <video
                src={value}
                controls
                className="max-h-56 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="relative h-48 w-full">
                <Image
                  src={value}
                  alt="Preview"
                  fill
                  className="rounded-lg object-cover"
                  unoptimized
                />
              </div>
            )}

            {/* Overlay actions */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-gray-800 shadow-lg transition hover:bg-white"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Replace
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                className="flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-red-600"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove
              </button>
            </div>
          </div>
        ) : uploading ? (
          /* ── Uploading state ── */
          <div className="flex h-36 flex-col items-center justify-center gap-3">
            <div className="relative h-10 w-10">
              <svg className="h-10 w-10 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-blue-600">Uploading to Cloudinary…</p>
          </div>
        ) : (
          /* ── Empty drop zone ── */
          <div className="flex h-36 flex-col items-center justify-center gap-2 px-4 text-center">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              dragOver ? "bg-blue-100" : "bg-gray-100 group-hover:bg-blue-100"
            }`}>
              {isVideo ? (
                <svg className={`h-5 w-5 transition-colors ${dragOver ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500"}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>
              ) : (
                <svg className={`h-5 w-5 transition-colors ${dragOver ? "text-blue-500" : "text-gray-400 group-hover:text-blue-500"}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <p className={`text-sm font-medium transition-colors ${dragOver ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"}`}>
                {dragOver ? "Drop to upload" : `Drag & drop or click to upload`}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {isVideo ? "MP4, WebM, OGG up to 50MB" : "PNG, JPG, WebP, GIF up to 10MB"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={fileAccept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* URL input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </span>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-8 pr-3 text-xs text-gray-600 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-all hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}