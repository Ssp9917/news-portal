"use client";

import { useState } from "react";
import { Play, X, Mail, Send, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedTitle } from "@/lib/i18n/news-fields";

interface VideoItem {
  _id: string;
  title: string;
  titleI18n?: Record<string, string>;
  category: string;
  date: string;
  videoUrl?: string;
  image?: string;
  author?: string;
}

interface VideoHubProps {
  news: VideoItem[];
  locale: Locale;
}

function getYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function VideoHub({ news, locale }: VideoHubProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const videoCards = news.slice(0, 3).map((item, idx) => {
    const ytId =
      getYouTubeId(item.videoUrl) ||
      ["dQw4w9WgXcQ", "L_LUpnjgPso", "fJ9rUzIMcZQ"][idx % 3];
    return {
      ...item,
      ytId,
      duration: ["12:45", "08:30", "15:20"][idx % 3],
    };
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
      }
    } catch {}
    setLoading(false);
  };

  return (
    <>
      <section className="mb-10">
        {/* Header: Vertical Red Bar + Title + "सभी देखें →" */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-[#c61d23]" />
            <h2 className="text-lg font-black text-gray-900 dark:text-white">
              वीडियो अपडेट्स
            </h2>
          </div>

          <button className="text-xs font-semibold text-gray-500 hover:text-[#c61d23] dark:text-neutral-400 dark:hover:text-red-400 transition-colors">
            सभी देखें →
          </button>
        </div>

        {/* 4 Columns: 3 Video Cards + 1 Newsletter Card */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {videoCards.map((item) => {
            const headline =
              getLocalizedTitle(item as any, locale) || item.title;

            return (
              <div
                key={item._id}
                onClick={() => setActiveVideoId(item.ytId)}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-gray-300"
              >
                <div>
                  {/* Thumbnail with centered circular red play button */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black mb-2.5">
                    <img
                      src={
                        item.image ||
                        `https://img.youtube.com/vi/${item.ytId}/hqdefault.jpg`
                      }
                      alt={headline}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />

                    {/* Centered Red Circle Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#c61d23] text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Duration badge at bottom right */}
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-mono text-white">
                      {item.duration}
                    </span>
                  </div>

                  <h3
                    className="text-xs font-bold leading-snug text-gray-900 dark:text-neutral-100 line-clamp-2 group-hover:text-[#c61d23] transition-colors"
                    style={{
                      fontFamily:
                        locale === "hi"
                          ? "var(--font-noto-serif-devanagari), Georgia, serif"
                          : "Georgia, serif",
                    }}
                  >
                    {headline}
                  </h3>
                </div>

                <div className="mt-2 text-[10px] text-gray-400">
                  {item.date}
                </div>
              </div>
            );
          })}

          {/* 4th Column: Newsletter Subscription Box (matches screenshot) */}
          <div className="flex flex-col justify-between rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">
                  न्यूज़लेटर सब्सक्राइब करें
                </h3>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950/40 text-pink-600">
                  <Mail className="h-3.5 w-3.5" />
                </div>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-neutral-400 leading-relaxed mb-4">
                हर सुबह ताज़ा समाचार सीधे अपने इनबॉक्स में पाएं।
              </p>

              {subscribed ? (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>सब्सक्राइब हो गया!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="अपना ईमेल दर्ज करें"
                    className="w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-[#c61d23] py-2 text-xs font-bold text-white shadow hover:bg-[#a8161b] transition-colors"
                  >
                    {loading ? "लोड हो रहा है..." : "सब्सक्राइब करें →"}
                  </button>
                </form>
              )}
            </div>

            <span className="text-[9px] text-gray-400 mt-2 block text-center">
              गोपनीयता नीति सुरक्षित • कभी भी अनसब्सक्राइब करें
            </span>
          </div>
        </div>
      </section>

      {/* Video Lightbox Modal */}
      {activeVideoId && (
        <div
          onClick={() => setActiveVideoId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl"
          >
            <button
              onClick={() => setActiveVideoId(null)}
              className="absolute top-2 right-2 z-10 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                title="Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
