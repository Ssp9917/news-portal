"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Flame, Clock, ArrowRight, CornerDownLeft } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { withLocale } from "@/lib/i18n/paths";

interface SearchResultItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  image?: string;
  date: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { locale } = useI18n();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setQuery("");
      setResults([]);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "Enter" && query.trim()) {
      onClose();
      router.push(`${withLocale(locale, "/search")}?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-white/95 dark:bg-slate-950/95 shadow-2xl backdrop-blur-2xl transition-all"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-white/10 px-4 py-3.5">
          <Search className="h-5 w-5 text-blue-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            aria-label="Search news, topics, politicians, sports, business"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search news, topics, politicians, sports, business..."
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search input"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
            ESC to close
          </kbd>
        </div>

        {/* Results / Suggestions Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching latest reports...
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Matching Headlines
              </span>
              {results.map((item) => (
                <Link
                  key={item._id}
                  href={withLocale(locale, `/news/${item.slug || item._id}`)}
                  onClick={onClose}
                  className="group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-blue-500/10 dark:hover:bg-blue-600/15"
                >
                  {item.image && (
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="rounded bg-blue-100 dark:bg-blue-900/40 px-1.5 py-0.2 text-[9px] font-bold uppercase text-blue-600 dark:text-blue-300">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No articles found matching &quot;{query}&quot;
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Try searching for broader keywords like राजनीति, खेल, or AI.
              </p>
            </div>
          )}

          {!query && (
            <div className="py-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {["संसद सत्र", "AI स्टार्टअप्स", "शेयर बाजार", "टीम इंडिया", "कैंसर किट", "JEE Main"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Flame className="h-3 w-3 text-amber-500" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {query.trim() && (
          <div className="border-t border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-slate-900/40 px-4 py-2.5 text-right">
            <button
              onClick={() => {
                onClose();
                router.push(`${withLocale(locale, "/search")}?q=${encodeURIComponent(query.trim())}`);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>View all results for &quot;{query}&quot;</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
