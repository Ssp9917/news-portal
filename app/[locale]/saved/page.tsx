"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bookmark, Trash2, ArrowLeft, ExternalLink } from "lucide-react";
import TopBar from "@/components/TopBar";
import PremiumHeader from "@/components/PremiumHeader";
import Footer from "@/components/Footer";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SavedArticlesPage() {
  const { user, bookmarks, toggleBookmark } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/bookmarks")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookmarks]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-neutral-100 transition-colors">
      <TopBar />
      <PremiumHeader />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/50 text-[#c61d23]">
              <Bookmark className="h-4 w-4 fill-current" />
            </span>
            <div>
              <h1 className="text-xl font-black text-gray-900 dark:text-white">
                सहेजे गए लेख (Saved News Bookmarks)
              </h1>
              <p className="text-xs text-gray-500">
                कुल {articles.length} लेख आपके संग्रह में सहेजे गए हैं
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-neutral-400 hover:text-[#c61d23] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>होमपेज पर लौटें</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto mb-2" />
            <p className="text-xs text-gray-500">सहेजे गए लेख लोड हो रहे हैं...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 dark:border-neutral-800 p-16 text-center">
            <Bookmark className="mx-auto h-12 w-12 text-gray-300 dark:text-neutral-700 mb-3" />
            <h3 className="text-sm font-bold text-gray-700 dark:text-neutral-300">
              आपके पास अभी कोई सहेजा गया लेख नहीं है
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-md mx-auto">
              समाचार पढ़ते समय बुकमार्क बटन दबाकर उन्हें बाद में ऑफ़लाइन या अपनी सुविधानुसार पढ़ने के लिए सहेजें।
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-xl bg-[#c61d23] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#a8161b]"
            >
              ताज़ा खबरें देखें →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {articles.map((item) => (
              <div
                key={item._id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800 mb-2.5">
                    <img
                      src={item.image || "https://placehold.co/400x250"}
                      alt={item.title}
                      width={400}
                      height={250}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 rounded bg-[#c61d23] px-2 py-0.5 text-[9px] font-bold text-white shadow">
                      {item.category}
                    </span>
                  </div>

                  <Link
                    href={`/news/${item.slug || item._id}`}
                    className="text-xs font-bold leading-snug text-gray-900 dark:text-white line-clamp-2 hover:text-[#c61d23] transition-colors"
                  >
                    {item.title}
                  </Link>

                  <p className="mt-1.5 text-[11px] leading-relaxed text-gray-600 dark:text-neutral-400 line-clamp-2">
                    {item.excerpt}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-2 text-[10px] text-gray-500 font-medium">
                  <span>{item.date}</span>
                  <button
                    onClick={() => toggleBookmark(item.slug || item._id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 font-bold cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>हटाएं</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

