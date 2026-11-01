"use client";

import { useState, useEffect } from "react";
import { X, Download, Sparkles } from "lucide-react";

interface BannerData {
  _id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl: string;
  bgGradient: string;
}

export default function StickyBottomMobileBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch("/api/admin/promotions?type=sticky_bottom_mobile&activeOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.banners && data.banners.length > 0) {
          const selected = data.banners[0];
          const dismissed = sessionStorage.getItem(`sticky_bottom_dismissed_${selected._id}`);
          if (!dismissed) {
            setBanner(selected);
            setVisible(true);

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
      sessionStorage.setItem(`sticky_bottom_dismissed_${banner._id}`, "true");
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
      role="complementary"
      aria-label="मोबाइल प्रचार बैनर"
      className={`fixed bottom-14 left-0 right-0 z-40 sm:hidden bg-gradient-to-r ${
        banner.bgGradient || "from-[#9a1418] via-[#c61d23] to-slate-950"
      } p-3 text-white shadow-2xl border-t border-white/20 backdrop-blur-lg animate-in slide-in-from-bottom-2`}
    >
      <div className="flex items-center justify-between gap-3">
        <a
          href={banner.ctaUrl}
          onClick={handleClick}
          className="flex-1 flex items-center gap-2.5 min-w-0"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
            <Download className="h-4.5 w-4.5" />
          </span>
          <div className="flex-1 min-w-0 leading-tight">
            <h4 className="text-xs font-black truncate">{banner.title}</h4>
            <p className="text-[10px] text-white/80 truncate mt-0.5">
              {banner.subtitle || "तेज़, प्रामाणिक और व्यक्तिगत समाचार"}
            </p>
          </div>
          <span className="rounded-full bg-white text-black px-3 py-1 text-[11px] font-black uppercase tracking-wider shrink-0 shadow">
            {banner.ctaText || "Install"}
          </span>
        </a>

        <button
          onClick={handleDismiss}
          aria-label="Close mobile banner"
          className="p-1.5 text-white/70 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

