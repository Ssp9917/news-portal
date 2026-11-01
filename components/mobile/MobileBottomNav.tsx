"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Grid, Bookmark, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useI18n } from "@/components/providers/i18n-provider";
import { withLocale } from "@/lib/i18n/paths";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, bookmarks, openAuthModal } = useAuth();
  const { locale } = useI18n();

  const isHome = pathname === withLocale(locale, "/") || pathname === "/";
  const isLocal = pathname.includes("/local-news");
  const isSaved = pathname.includes("/saved");
  const isProfile = pathname.includes("/profile");

  return (
    <nav
      role="navigation"
      aria-label="मोबाइल निचला नेविगेशन (Mobile Bottom Navigation)"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-gray-200/80 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl shadow-lg pb-safe"
    >
      <div className="grid grid-cols-5 h-14 items-center">
        {/* 1. Home */}
        <Link
          href={withLocale(locale, "/")}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 text-center transition-colors ${
            isHome ? "text-[#c61d23] font-black" : "text-gray-500 dark:text-neutral-400 hover:text-gray-900"
          }`}
          aria-label="होमपेज"
        >
          <Home className={`h-4.5 w-4.5 ${isHome ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] leading-tight">होम</span>
        </Link>

        {/* 2. Local News */}
        <Link
          href={withLocale(locale, "/local-news")}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 text-center transition-colors ${
            isLocal ? "text-[#c61d23] font-black" : "text-gray-500 dark:text-neutral-400 hover:text-gray-900"
          }`}
          aria-label="लोकल न्यूज़"
        >
          <MapPin className={`h-4.5 w-4.5 ${isLocal ? "stroke-[2.5]" : ""}`} />
          <span className="text-[10px] leading-tight">मेरा शहर</span>
        </Link>

        {/* 3. Explore / Categories */}
        <Link
          href={withLocale(locale, "/category/national")}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-center text-gray-500 dark:text-neutral-400 hover:text-gray-900 transition-colors"
          aria-label="श्रेणियां"
        >
          <Grid className="h-4.5 w-4.5" />
          <span className="text-[10px] leading-tight">श्रेणियां</span>
        </Link>

        {/* 4. Saved Bookmarks */}
        <Link
          href={withLocale(locale, "/saved")}
          className={`relative flex flex-col items-center justify-center gap-0.5 py-1 text-center transition-colors ${
            isSaved ? "text-[#c61d23] font-black" : "text-gray-500 dark:text-neutral-400 hover:text-gray-900"
          }`}
          aria-label="सहेजे गए समाचार"
        >
          <div className="relative">
            <Bookmark className={`h-4.5 w-4.5 ${isSaved ? "stroke-[2.5]" : ""}`} />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#c61d23] text-white text-[8px] font-bold">
                {bookmarks.length > 9 ? "9+" : bookmarks.length}
              </span>
            )}
          </div>
          <span className="text-[10px] leading-tight">सहेजे गए</span>
        </Link>

        {/* 5. Profile / Account */}
        {user ? (
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center gap-0.5 py-1 text-center transition-colors ${
              isProfile ? "text-[#c61d23] font-black" : "text-gray-500 dark:text-neutral-400 hover:text-gray-900"
            }`}
            aria-label="प्रोफ़ाइल"
          >
            <User className={`h-4.5 w-4.5 ${isProfile ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] leading-tight">खाता</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="flex flex-col items-center justify-center gap-0.5 py-1 text-center text-gray-500 dark:text-neutral-400 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="लॉगिन करें"
          >
            <User className="h-4.5 w-4.5" />
            <span className="text-[10px] leading-tight">लॉगिन</span>
          </button>
        )}
      </div>
    </nav>
  );
}

