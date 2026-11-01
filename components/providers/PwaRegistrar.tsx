"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export default function PwaRegistrar() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker for offline support & PWA caching
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then(() => {
            // Service worker registered
          })
          .catch((err) => {
            console.warn("SW registration error (non-fatal):", err);
          });
      });
    }

    // 2. Listen for PWA Install Prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Check if dismissed recently
      const dismissed = sessionStorage.getItem("bp_pwa_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("bp_pwa_dismissed", "true");
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;

  return (
    <div
      role="banner"
      aria-label="ऐप इंस्टॉल बैनर"
      className="fixed bottom-16 sm:bottom-6 left-4 sm:left-6 z-40 max-w-sm rounded-2xl border border-white/20 bg-gradient-to-r from-[#9a1418] via-[#c61d23] to-slate-900 p-4 text-white shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
            <Download className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-xs font-black">Bharat Pulse ऐप इंस्टॉल करें</h4>
            <p className="text-[10px] text-white/80 mt-0.5">
              तेज़, ऑफ़लाइन सपोर्ट और ब्रेकिंग अलर्ट्स
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          aria-label="Close"
          className="text-white/70 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="flex-1 rounded-xl bg-white text-black py-1.5 text-xs font-black shadow hover:bg-slate-100 transition-colors cursor-pointer text-center"
        >
          अभी इंस्टॉल करें
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-xl border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:text-white cursor-pointer"
        >
          बाद में
        </button>
      </div>
    </div>
  );
}

