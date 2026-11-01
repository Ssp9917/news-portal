"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Bookmark, ArrowRight } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [cachedArticles, setCachedArticles] = useState<any[]>([]);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Load guest bookmarks from localStorage
    try {
      const saved = localStorage.getItem("bharat_pulse_guest_bookmarks");
      if (saved) {
        setCachedArticles(JSON.parse(saved));
      }
    } catch {}

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = "/";
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col justify-between p-4">
      {/* Top Header */}
      <div className="container mx-auto max-w-2xl pt-6 flex items-center justify-between">
        <BrandLogo variant="header" />
        <span className="flex items-center gap-1.5 rounded-full bg-red-950/60 border border-red-500/30 px-3 py-1 text-[11px] font-bold text-red-400">
          <WifiOff className="h-3 w-3" />
          <span>ऑफ़लाइन मोड (Offline)</span>
        </span>
      </div>

      {/* Main Content */}
      <main className="container mx-auto max-w-xl text-center py-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9a1418] to-[#c61d23] text-white shadow-xl shadow-red-900/30">
          <WifiOff className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-black text-white">
          इंटरनेट कनेक्शन उपलब्ध नहीं है
        </h1>
        <p className="mt-2 text-xs text-gray-400 leading-relaxed max-w-md mx-auto">
          आप वर्तमान में ऑफ़लाइन हैं। आपके द्वारा पहले देखे गए अथवा सहेजे गए लेख आपके ब्राउज़र कैश में सुरक्षित हैं।
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 rounded-xl bg-[#c61d23] hover:bg-[#a8161b] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>पुनः कनेक्ट करें (Retry)</span>
          </button>

          <Link
            href="/saved"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-5 py-2.5 text-xs font-bold text-white transition-all"
          >
            <Bookmark className="h-3.5 w-3.5 text-amber-300" />
            <span>सहेजे गए लेख पढ़ें →</span>
          </Link>
        </div>

        {/* Cached Articles Section */}
        {cachedArticles.length > 0 && (
          <div className="mt-10 text-left rounded-2xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur-md">
            <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5 text-red-500" />
              <span>आपके सहेजे गए लेख (Offline Available):</span>
            </h3>
            <div className="space-y-2">
              {cachedArticles.slice(0, 5).map((slug, idx) => (
                <Link
                  key={idx}
                  href={`/news/${slug}`}
                  className="flex items-center justify-between rounded-lg bg-white/5 p-2.5 text-xs font-semibold text-gray-200 hover:bg-white/10 transition-colors"
                >
                  <span className="truncate">{slug.replace(/-/g, " ")}</span>
                  <ArrowRight className="h-3 w-3 text-red-400 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer Notice */}
      <footer className="container mx-auto max-w-2xl pb-6 text-center text-[10px] text-gray-500">
        BHARAT PULSE PWA Offline Support • नेटवर्क बहाल होते ही ताज़ा समाचार स्वतः सिंक हो जाएंगे।
      </footer>
    </div>
  );
}

