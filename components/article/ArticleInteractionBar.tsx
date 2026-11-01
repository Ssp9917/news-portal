"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Type,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface ArticleInteractionBarProps {
  articleId: string;
  title: string;
  category: string;
  image?: string;
  url?: string;
}

export default function ArticleInteractionBar({
  articleId,
  title,
  category,
  image,
  url,
}: ArticleInteractionBarProps) {
  const { isBookmarked, toggleBookmark } = useAuth();
  const [copied, setCopied] = useState(false);
  const bookmarked = isBookmarked(articleId);

  // Automatically record to reading history
  useEffect(() => {
    if (!articleId) return;
    try {
      fetch("/api/user/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          title,
          category,
          image,
        }),
      }).catch(() => {});
    } catch {}
  }, [articleId, title, category, image]);

  const getShareUrl = () => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  };

  const copyToClipboard = () => {
    const link = getShareUrl();
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentUrl = typeof window !== "undefined" ? getShareUrl() : "";
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(currentUrl);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Bookmark Button */}
      <button
        type="button"
        onClick={() => toggleBookmark(articleId)}
        aria-label={bookmarked ? "Remove from bookmarks" : "Save article"}
        title={bookmarked ? "लेख सहेजा गया है" : "लेख सहेजें"}
        className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm ${
          bookmarked
            ? "border-red-600 bg-red-600 text-white shadow-red-500/20"
            : "border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-red-500 hover:text-red-600"
        }`}
      >
        <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-current" : ""}`} />
        <span>{bookmarked ? "सहेजा गया" : "सहेजें"}</span>
      </button>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
        className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
      >
        <MessageCircle className="h-3.5 w-3.5 fill-current" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Telegram */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on Telegram"
        title="Share on Telegram"
        className="flex items-center gap-1.5 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
      >
        <Send className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Telegram</span>
      </a>

      {/* Twitter / X */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on X (Twitter)"
        title="Share on X"
        className="flex items-center gap-1.5 rounded-xl border border-slate-500/20 bg-slate-500/10 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-black hover:text-white transition-all shadow-sm"
      >
        <span className="font-sans font-bold">𝕏</span>
      </a>

      {/* Copy Link */}
      <button
        type="button"
        onClick={copyToClipboard}
        aria-label="Copy article link"
        title="कॉपी लिंक"
        className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">कॉपी हुआ!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">कॉपी लिंक</span>
          </>
        )}
      </button>
    </div>
  );
}

