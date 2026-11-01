"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

interface PromotionalBannerSlotProps {
  placement: "hero" | "sidebar" | "in_article" | "app_install";
  className?: string;
}

export default function PromotionalBannerSlot({
  placement,
  className = "",
}: PromotionalBannerSlotProps) {
  const [banner, setBanner] = useState<any | null>(null);

  useEffect(() => {
    fetch(`/api/admin/promotions?type=${placement}&activeOnly=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data.banners && data.banners.length > 0) {
          setBanner(data.banners[0]);
          fetch("/api/promotions/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bannerId: data.banners[0]._id, event: "impression" }),
          }).catch(() => {});
        }
      })
      .catch(() => {});
  }, [placement]);

  if (!banner) return null;

  const handleClick = () => {
    fetch("/api/promotions/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bannerId: banner._id, event: "click" }),
    }).catch(() => {});
  };

  return (
    <aside
      aria-label="प्रायोजित प्रचार (Promotional Highlight)"
      className={`relative my-8 overflow-hidden rounded-2xl bg-gradient-to-r ${
        banner.bgGradient || "from-[#9a1418] via-[#c61d23] to-slate-900"
      } p-5 sm:p-6 text-white shadow-xl ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 rounded bg-black/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-300 mb-2">
            <Sparkles className="h-3 w-3" />
            <span>विशेष पहल (Special Campaign)</span>
          </span>
          <h4 className="text-base font-black leading-snug">{banner.title}</h4>
          {banner.subtitle && (
            <p className="mt-1 text-xs text-white/85 leading-relaxed max-w-xl">
              {banner.subtitle}
            </p>
          )}
        </div>

        <a
          href={banner.ctaUrl}
          onClick={handleClick}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-black shadow-lg hover:bg-slate-100 transition-all shrink-0"
        >
          <span>{banner.ctaText || "Explore"}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </aside>
  );
}

