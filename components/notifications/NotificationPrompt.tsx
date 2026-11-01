"use client";

import { useState, useEffect } from "react";
import { Bell, Sparkles, X, CheckCircle2 } from "lucide-react";
import { requestPushPermission } from "@/lib/firebase/client";
import { useAuth } from "@/components/providers/AuthProvider";

const DISMISS_KEY = "bharat_pulse_notif_dismissed_until";

export default function NotificationPrompt() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window === "undefined" || !("Notification" in window)) return;

    // If permission already decided, do not show
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return;
    }

    // Check if dismissed recently (respect dismissal for 7 days)
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // Never show immediately on load! Show only after user has scrolled or spent 8 seconds on page
    const timer = setTimeout(() => {
      setVisible(true);
    }, 8000);

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    const result = await requestPushPermission({
      userId: user?.id,
      city: user?.preferences?.city,
      state: user?.preferences?.state,
      language: user?.preferences?.language || "hi",
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setVisible(false);
      }, 3500);
    } else {
      // User declined or closed
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    // Dismiss for 7 days
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="सूचना सूचना (Notification alert banner)"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 max-w-sm w-[calc(100%-2rem)] rounded-2xl border border-white/20 bg-white/95 dark:bg-neutral-900/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#9a1418] to-[#c61d23] text-white shadow-md">
          <Bell className="h-5 w-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>हर बड़ी खबर से रहें एक कदम आगे</span>
              <Sparkles className="h-3 w-3 text-amber-500 fill-current" />
            </h4>
            <button
              onClick={handleDismiss}
              aria-label="Dismiss notification prompt"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-1 text-[11px] leading-relaxed text-gray-600 dark:text-neutral-400">
            {success
              ? "नोटिफिकेशन सक्रिय हो गए हैं! अब आप कोई भी महत्वपूर्ण ब्रेकिंग न्यूज़ नहीं चूकेंगे।"
              : "देश, राजनीति और आपके शहर की ब्रेकिंग खबरें सीधे अपने डिवाइस पर तुरंत पाएं।"}
          </p>

          {success ? (
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>सफलतापूर्वक सक्षम किया गया!</span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={handleEnable}
                disabled={loading}
                className="rounded-xl bg-[#c61d23] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-[#a8161b] transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "प्रतीक्षा करें..." : "नोटिफिकेशन सक्षम करें"}
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-xl border border-gray-200 dark:border-neutral-700 bg-transparent px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                बाद में (Maybe Later)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

