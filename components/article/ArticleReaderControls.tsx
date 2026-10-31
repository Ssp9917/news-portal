"use client";

import { useState } from "react";
import { Type, Printer, Bookmark, Check } from "lucide-react";

interface ArticleReaderControlsProps {
  onFontSizeChange: (size: "sm" | "base" | "lg" | "xl") => void;
  currentSize: "sm" | "base" | "lg" | "xl";
}

export default function ArticleReaderControls({
  onFontSizeChange,
  currentSize,
}: ArticleReaderControlsProps) {
  const [bookmarked, setBookmarked] = useState(false);

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 px-3 py-1.5 backdrop-blur-md shadow-sm text-xs">
      <span className="text-slate-400 font-semibold text-[11px] mr-1 hidden sm:inline">
        Font Size:
      </span>
      <button
        onClick={() => onFontSizeChange("sm")}
        title="Small font"
        className={`px-2 py-0.5 rounded font-bold transition-colors ${
          currentSize === "sm"
            ? "bg-blue-600 text-white"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
        }`}
      >
        A-
      </button>
      <button
        onClick={() => onFontSizeChange("base")}
        title="Standard font"
        className={`px-2 py-0.5 rounded font-bold transition-colors ${
          currentSize === "base"
            ? "bg-blue-600 text-white"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
        }`}
      >
        A
      </button>
      <button
        onClick={() => onFontSizeChange("lg")}
        title="Large font"
        className={`px-2 py-0.5 rounded font-bold transition-colors ${
          currentSize === "lg"
            ? "bg-blue-600 text-white"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
        }`}
      >
        A+
      </button>
      <button
        onClick={() => onFontSizeChange("xl")}
        title="Extra large font"
        className={`px-2 py-0.5 rounded font-bold transition-colors ${
          currentSize === "xl"
            ? "bg-blue-600 text-white"
            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
        }`}
      >
        A++
      </button>

      <div className="h-3 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

      <button
        onClick={() => window.print()}
        title="Print Story"
        className="flex items-center gap-1 rounded p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white"
      >
        <Printer className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={toggleBookmark}
        title="Save Article"
        className={`flex items-center gap-1 rounded p-1 transition-colors ${
          bookmarked
            ? "text-amber-500"
            : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
        }`}
      >
        <Bookmark className="h-3.5 w-3.5 fill-current" />
      </button>
    </div>
  );
}
