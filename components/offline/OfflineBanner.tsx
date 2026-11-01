"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WifiOff, ArrowRight } from "lucide-react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setOffline(!navigator.onLine);

    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 inset-x-0 z-50 bg-amber-600 px-4 py-2 text-center text-xs font-bold text-white shadow-md animate-in slide-in-from-top-2"
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>आप ऑफ़लाइन हैं (You are currently offline).</span>
        <Link
          href="/offline"
          className="underline font-black hover:text-black transition-colors ml-1"
        >
          सहेजे गए लेख पढ़ें →
        </Link>
      </div>
    </div>
  );
}

