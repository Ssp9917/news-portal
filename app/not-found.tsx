import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";
import { defaultLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";

export default function NotFound() {
  const homeHref = withLocale(defaultLocale, "/");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-white p-4 text-center font-anek transition-colors dark:bg-neutral-950">
      <div className="mb-6 animate-pulse rounded-full bg-red-50 p-6 dark:bg-red-950/30">
        <AlertTriangle className="h-16 w-16 text-[#D32F2F]" />
      </div>

      <h1 className="mb-2 font-anek text-6xl font-bold text-gray-900 dark:text-neutral-100 md:text-8xl">
        404
      </h1>

      <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-neutral-200 md:text-2xl">
        Page not found
      </h2>

      <p className="mb-8 max-w-md leading-relaxed text-gray-500 dark:text-neutral-400">
        The page you requested may have been moved, renamed, or is temporarily unavailable.
      </p>

      <Link
        href={homeHref}
        className="inline-flex transform items-center gap-2 rounded-lg bg-[#D32F2F] px-6 py-3 font-medium text-white transition-all hover:-translate-y-1 hover:bg-[#B71C1C] hover:shadow-lg"
      >
        <Home className="h-5 w-5" />
        Back to homepage
      </Link>
    </div>
  );
}
