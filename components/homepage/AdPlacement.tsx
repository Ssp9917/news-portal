"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface AdPlacementProps {
  slot:
    | "header_top"
    | "hero_after"
    | "feed_inline"
    | "article_sidebar"
    | "article_content"
    | "footer_above"
    | "mobile_sticky";
}

interface AdData {
  _id: string;
  title: string;
  adType: "adsense" | "custom_banner" | "html_code";
  adCode?: string;
  imageUrl?: string;
  targetUrl?: string;
  isActive: boolean;
}

export default function AdPlacement({ slot }: AdPlacementProps) {
  const [ad, setAd] = useState<AdData | null>(null);

  useEffect(() => {
    fetch(`/api/admin/ads?slot=${slot}&active=true`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAd(data[0]);
        }
      })
      .catch(() => {});
  }, [slot]);

  if (!ad || !ad.isActive) return null;

  return (
    <div className="my-8 flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-100/50 dark:bg-white/[0.02] p-2 text-center backdrop-blur-sm">
      <span className="text-[9px] uppercase tracking-widest text-slate-400 mb-1 font-semibold">
        ADVERTISEMENT
      </span>

      {ad.adType === "custom_banner" && ad.imageUrl && (
        <a
          href={ad.targetUrl || "#"}
          target="_blank"
          rel="noreferrer sponsored"
          className="block w-full max-w-4xl overflow-hidden rounded-xl transition-opacity hover:opacity-95"
        >
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="w-full object-cover max-h-36 mx-auto rounded-lg"
          />
        </a>
      )}

      {ad.adType === "adsense" && (
        <div className="w-full min-h-[90px] flex items-center justify-center bg-slate-200/50 dark:bg-white/5 rounded-lg text-xs text-slate-400">
          {ad.adCode ? (
            <div dangerouslySetInnerHTML={{ __html: ad.adCode }} />
          ) : (
            <span>Google AdSense Slot</span>
          )}
        </div>
      )}

      {ad.adType === "html_code" && ad.adCode && (
        <div
          className="w-full max-w-4xl"
          dangerouslySetInnerHTML={{ __html: ad.adCode }}
        />
      )}
    </div>
  );
}
