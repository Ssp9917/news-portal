"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useI18n } from "@/components/providers/i18n-provider";
import { withLocale } from "@/lib/i18n/paths";

function SearchContent() {
  const { locale, t } = useI18n();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      fetch(`/api/news?query=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      <Header />
      <Navbar />

      <main className="container mx-auto max-w-7xl flex-grow px-4 py-8">
        <h1 className="mb-6 border-l-4 border-[#D32F2F] pl-3 text-2xl font-bold">
          {t("search.resultsFor")}: &quot;{query}&quot;
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-gray-500 dark:text-neutral-400">{t("search.searching")}</div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((item) => (
              <Link
                href={withLocale(
                  locale,
                  `/news/${(item.slug as string) || String(item._id)}`
                )}
                key={String(item._id)}
                className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-neutral-900"
              >
                <div className="relative aspect-video bg-gray-200 dark:bg-neutral-800">
                  <Image
                    src={(item.image as string) || "https://placehold.co/600x400"}
                    alt={String(item.title)}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2 flex gap-2 text-xs text-gray-500 dark:text-neutral-400">
                    <span className="font-bold uppercase text-[#D32F2F]">
                      {String(item.category)}
                    </span>
                    <span>•</span>
                    <span>{String(item.date)}</span>
                  </div>
                  <h2 className="line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-[#D32F2F] dark:text-neutral-100">
                    {String(item.title)}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-neutral-300">
                    {String(item.excerpt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-white p-8 py-20 text-gray-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            <p className="mb-2 text-lg">{t("search.noResults")}</p>
            <p className="text-sm">{t("search.tryOther")}</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-neutral-950">
          <Header />
          <Navbar />
          <div className="flex flex-grow items-center justify-center p-12 text-neutral-600 dark:text-neutral-400">
            ...
          </div>
          <Footer />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
