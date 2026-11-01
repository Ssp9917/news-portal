"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Heart,
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
  const { user, openAuthModal, isBookmarked, toggleBookmark } = useAuth();
  const [copied, setCopied] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const bookmarked = isBookmarked(articleId);

  // Fetch live likes status
  useEffect(() => {
    if (!articleId) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
    fetch(`/api/news/${encodeURIComponent(articleId)}/like`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setLikes(data.likes || 0);
          setHasLiked(Boolean(data.hasLiked));
        }
      })
      .catch(() => {});
  }, [articleId, user]);

  // Handle strictly login-gated like
  const handleToggleLike = async () => {
    if (!user) {
      openAuthModal();
      return;
    }

    setLikeLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      const res = await fetch(`/api/news/${encodeURIComponent(articleId)}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (res.ok) {
        setLikes(data.likes || 0);
        setHasLiked(Boolean(data.hasLiked));
      } else if (data.loginRequired) {
        openAuthModal();
      }
    } catch {} finally {
      setLikeLoading(false);
    }
  };

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
    const deeplink = `${link}${link.includes("?") ? "&" : "?"}utm_source=copy_link&utm_medium=deeplink`;
    navigator.clipboard.writeText(deeplink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Native mobile share sheet with deeplink
  const handleNativeShare = async () => {
    const rawLink = getShareUrl();
    const deeplinkUrl = `${rawLink}${rawLink.includes("?") ? "&" : "?"}utm_source=app_share&utm_medium=deeplink`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `*${title}*\n\nपूरी खबर भारत पल्स (Bharat Pulse) पर पढ़ें:`,
          url: deeplinkUrl,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    copyToClipboard();
  };

  const currentUrl = typeof window !== "undefined" ? getShareUrl() : "";
  const deeplinkWhatsapp = `${currentUrl}${currentUrl.includes("?") ? "&" : "?"}utm_source=whatsapp&utm_medium=deeplink`;
  const deeplinkTelegram = `${currentUrl}${currentUrl.includes("?") ? "&" : "?"}utm_source=telegram&utm_medium=deeplink`;
  const deeplinkTwitter = `${currentUrl}${currentUrl.includes("?") ? "&" : "?"}utm_source=twitter&utm_medium=deeplink`;

  const encodedTitle = encodeURIComponent(`*${title}*`);
  const encodedWhatsappUrl = encodeURIComponent(deeplinkWhatsapp);
  const encodedTelegramUrl = encodeURIComponent(deeplinkTelegram);
  const encodedTwitterUrl = encodeURIComponent(deeplinkTwitter);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%0A%0A${encodedWhatsappUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedTelegramUrl}&text=${encodedTitle}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedTwitterUrl}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 1. Login-Gated Heart / Like Button */}
      <button
        type="button"
        onClick={handleToggleLike}
        disabled={likeLoading}
        aria-label={hasLiked ? "Unlike article" : "Like article"}
        title={user ? (hasLiked ? "लाइक हटाएं" : "लाइक करें") : "लाइक करने के लिए लॉगिन करें"}
        className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer ${
          hasLiked
            ? "border-rose-500 bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-500/40"
            : "border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-rose-500 hover:text-rose-600"
        }`}
      >
        <Heart
          className={`h-4 w-4 transition-transform active:scale-125 ${
            hasLiked ? "fill-rose-500 text-rose-500" : ""
          }`}
        />
        <span>{likes > 0 ? likes.toLocaleString("hi-IN") : "लाइक"}</span>
      </button>

      {/* 2. Bookmark Button */}
      <button
        type="button"
        onClick={() => toggleBookmark(articleId)}
        aria-label={bookmarked ? "Remove from bookmarks" : "Save article"}
        title={bookmarked ? "लेख सहेजा गया है" : "लेख सहेजें"}
        className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer ${
          bookmarked
            ? "border-red-600 bg-red-600 text-white shadow-red-500/20"
            : "border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-red-500 hover:text-red-600"
        }`}
      >
        <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-current" : ""}`} />
        <span>{bookmarked ? "सहेजा गया" : "सहेजें"}</span>
      </button>

      {/* 3. Native Device Share Button (Deeplink Sheet) */}
      <button
        type="button"
        onClick={handleNativeShare}
        aria-label="Share article via app or social"
        title="शेयर करें (Native Share)"
        className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm cursor-pointer"
      >
        <Share2 className="h-3.5 w-3.5" />
        <span>शेयर करें</span>
      </button>

      {/* 4. WhatsApp with Deeplink */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on WhatsApp"
        title="WhatsApp पर शेयर करें"
        className="flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
      >
        <MessageCircle className="h-3.5 w-3.5 fill-current" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* 5. Telegram with Deeplink */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on Telegram"
        title="Telegram पर शेयर करें"
        className="flex items-center gap-1.5 rounded-xl border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
      >
        <Send className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Telegram</span>
      </a>

      {/* 6. Twitter / X with Deeplink */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Share on X (Twitter)"
        title="X पर पोस्ट करें"
        className="flex items-center gap-1.5 rounded-xl border border-slate-500/20 bg-slate-500/10 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-black hover:text-white transition-all shadow-sm"
      >
        <span className="font-sans font-bold">𝕏</span>
      </a>

      {/* 7. Copy Deeplink Button */}
      <button
        type="button"
        onClick={copyToClipboard}
        aria-label="Copy article link"
        title="कॉपी डीपलिंक"
        className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm cursor-pointer"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">लिंक कॉपी हुआ!</span>
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


