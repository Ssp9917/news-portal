import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";
import { getLocalizedTitle } from "@/lib/i18n/news-fields";

interface BreakingNewsProps {
  news: Array<Record<string, unknown>>;
  locale: Locale;
  breakingLabel: string;
}

export default function BreakingNews({
  news,
  locale,
  breakingLabel,
}: BreakingNewsProps) {
  const breakingNews = news.filter((item) => {
    if (!item.isBreaking) return false;

    const newsDate = new Date(String(item.updatedAt || item.createdAt));
    const now = new Date();
    const hoursDiff =
      (now.getTime() - newsDate.getTime()) / (1000 * 3600);

    return hoursDiff <= 48;
  });

  if (breakingNews.length === 0) return null;

  return (
    <div className="border-b border-gray-200 bg-gray-100 transition-colors dark:border-neutral-800 dark:bg-neutral-900/60">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center">
          <div className="relative z-10 whitespace-nowrap bg-[#D32F2F] px-4 py-2 text-xs font-bold uppercase text-white">
            {breakingLabel}
            <span className="absolute right-[-12px] top-0 border-l-[12px] border-l-[#D32F2F] border-b-[36px] border-b-transparent border-t-0 border-t-transparent" />
          </div>

          <div className="relative flex h-10 flex-1 items-center overflow-hidden bg-gray-100 dark:bg-neutral-950/80">
            <div className="animate-marquee flex gap-10 whitespace-nowrap">
              {[0, 1].map((round) =>
                breakingNews.map((item, index) => {
                  const id = String(item.slug ?? item._id ?? "");
                  const key = `${round}-${index}-${id}`;
                  return (
                    <span key={key} className="inline-flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-[#D32F2F]" />
                      <Link
                        href={withLocale(locale, `/news/${id}`)}
                        className="font-medium text-gray-800 transition-colors hover:text-[#D32F2F] dark:text-neutral-200 dark:hover:text-red-400"
                      >
                        {getLocalizedTitle(item as never, locale)}
                      </Link>
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
