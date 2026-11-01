"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, ArrowRight } from "lucide-react";

interface BannerData {
  _id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl: string;
  bgGradient: string;
}

export default function TopAnnouncementStrip() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/admin/promotions?type=announcement_strip&activeOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.banners && data.banners.length > 0) {
          const selected = data.banners[0];
          // Check session dismissal
          const dismissed = sessionStorage.getItem(`promo_strip_dismissed_${selected._id}`);
          if (!dismissed) {
            setBanner(selected);
            setVisible(true);

            // Track impression
            fetch("/api/promotions/track", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bannerId: selected._id, event: "impression" }),
            }).catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    if (banner) {
      sessionStorage.setItem(`promo_strip_dismissed_${banner._id}`, "true");
    }
    setVisible(false);
  };

  const handleClick = () => {
    if (banner) {
      fetch("/api/promotions/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bannerId: banner._id, event: "click" }),
      }).catch(() => {});
    }
  };

  if (!visible || !banner) return null;

  return (
    <div
      role="banner"
      aria-label="विशेष घोषणा (Announcement Banner)"
      className={`relative w-full bg-gradient-to-r ${banner.bgGradient || "from-[#9a1418] via-[#c61d23] to-slate-900"} px-4 py-1.5 text-white shadow-md text-xs`}
    >
      <div className="container mx-auto flex max-w-7xl items-center justify-between gap-3">
        <a
          href={banner.ctaUrl}
          onClick={handleClick}
          className="flex-1 flex items-center justify-center gap-2 hover:opacity-95 transition-opacity text-center min-w-0"
        >
          <Sparkles className="h-3.5 w-3.5 fill-current text-amber-300 shrink-0" />
          <span className="font-bold truncate">{banner.title}</span>
          {banner.subtitle && (
            <span className="hidden md:inline text-white/80 text-[11px] font-normal truncate">
              • {banner.subtitle}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 hover:bg-white/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shrink-0 ml-1">
            <span>{banner.ctaText || "Explore"}</span>
            <ArrowRight className="h-2.5 w-2.5" />
          </span>
        </a>

        <button
          onClick={handleDismiss}
          aria-label="बैनर बंद करें"
          className="rounded p-1 text-white/70 hover:bg-black/20 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

