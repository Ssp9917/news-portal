"use client";

import { useState } from "react";
import {
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
} from "lucide-react";

interface SocialShareBarProps {
  title: string;
  url?: string;
  size?: "sm" | "md" | "lg";
}

export default function SocialShareBar({
  title,
  url,
  size = "md",
}: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);

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
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
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
        aria-label="Share on X"
        title="Share on X"
        className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-black hover:text-white transition-all shadow-sm"
      >
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span className="hidden sm:inline">X / Post</span>
      </a>

      {/* Facebook */}
      <a
        href={facebookUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on Facebook"
        title="Share on Facebook"
        className="flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
      >
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </a>

      {/* Copy Link */}
      <button
        onClick={copyToClipboard}
        aria-label="Copy article link to clipboard"
        title="Copy article link"
        className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-500">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
