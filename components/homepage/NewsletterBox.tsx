"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Sparkles, Send, ShieldCheck } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

interface NewsletterBoxProps {
  locale: Locale;
  title?: string;
  subtitle?: string;
}

export default function NewsletterBox({
  locale,
  title = "दैनिक न्यूज़लेटर (Bharat Pulse Dispatch)",
  subtitle = "हर सुबह सबसे महत्वपूर्ण राष्ट्रीय व वैश्विक समाचारों का सार सीधे अपने इनबॉक्स में पाएं।",
}: NewsletterBoxProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubscribed(true);
        setMessage(data.message || "Thank you for subscribing!");
        setEmail("");
      } else {
        setMessage(data.message || "Could not subscribe");
      }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="newsletter-subscribe"
      className="relative mb-12 overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-slate-950/80 p-8 lg:p-12 backdrop-blur-2xl text-white shadow-2xl"
    >
      {/* Background Glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/30">
          <Mail className="h-7 w-7" />
        </div>

        <h2
          className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl"
          style={{
            fontFamily:
              locale === "hi"
                ? "var(--font-noto-serif-devanagari), Georgia, serif"
                : "Georgia, serif",
          }}
        >
          {title}
        </h2>

        <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {subscribed ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-6 py-4 text-emerald-300">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold">{message}</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              aria-label={locale === "hi" ? "अपना ईमेल पता दर्ज करें" : "Enter your email address"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={locale === "hi" ? "अपना ईमेल पता दर्ज करें..." : "Enter your email address..."}
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-cyan-400 focus:bg-slate-900 focus:outline-none backdrop-blur-md"
            />
            <button
              type="submit"
              disabled={loading}
              aria-label={loading ? "Subscribing..." : locale === "hi" ? "न्यूज़लेटर की सदस्यता लें" : "Subscribe to newsletter"}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              <span>{loading ? "Subscribing..." : locale === "hi" ? "जुड़ें" : "Subscribe"}</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>Zero spam • Unsubscribe anytime with 1-click</span>
        </div>
      </div>
    </section>
  );
}
