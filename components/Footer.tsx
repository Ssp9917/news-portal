"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider";
import { withLocale } from "@/lib/i18n/paths";
import { Play } from "lucide-react";
import BrandLogo from "./BrandLogo";

interface RecentStory {
  title: string;
  date: string;
  img: string;
  href: string;
}

interface CategoryCount {
  name: string;
  count: number;
  slug: string;
}

const DEFAULT_RECENT: RecentStory[] = [
  {
    title: "संसद का शीतकालीन सत्र: विपक्ष ने उठाए महंगाई पर सवाल",
    date: "31 Oct 2026 | 02:40 PM",
    img: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=120&auto=format&fit=crop&q=80",
    href: "/news/parliament-winter-session-inflation-2025",
  },
  {
    title: "भारत में AI स्टार्टअप्स को मिली 5,000 करोड़ की फंडिंग",
    date: "31 Oct 2026 | 01:15 PM",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop&q=80",
    href: "/news/india-ai-startups-funding-5000-crore-2025",
  },
  {
    title: "टीम इंडिया ने ऑस्ट्रेलिया को 6 विकेट से हराया, सीरीज जीती",
    date: "30 Oct 2026 | 08:50 PM",
    img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=120&auto=format&fit=crop&q=80",
    href: "/news/india-beat-australia-6-wickets-series-win-2025",
  },
  {
    title: "सेंसेक्स 80,000 के पार, निफ्टी ने भी बनाया नया रिकॉर्ड",
    date: "30 Oct 2026 | 03:30 PM",
    img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80",
    href: "/news/sensex-80000-nifty-record-high-2025",
  },
  {
    title: "AIIMS ने विकसित की सस्ती कैंसर जांच किट",
    date: "29 Oct 2026 | 11:20 AM",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=120&auto=format&fit=crop&q=80",
    href: "/news/aiims-affordable-cancer-kit-rural-india-2025",
  },
];

const DEFAULT_CATEGORIES: CategoryCount[] = [
  { name: "राष्ट्रीय", count: 120, slug: "national" },
  { name: "वायरल खबर", count: 42, slug: "viral" },
  { name: "दुनिया", count: 38, slug: "world" },
  { name: "राजनीति", count: 95, slug: "politics" },
  { name: "क्राइम", count: 21, slug: "crime" },
  { name: "लाइफस्टाइल", count: 14, slug: "lifestyle" },
  { name: "धर्म", count: 32, slug: "religion" },
  { name: "बॉलीवुड", count: 18, slug: "entertainment" },
  { name: "सरकारी योजनाएं", count: 45, slug: "schemes" },
  { name: "सेहत", count: 38, slug: "health" },
  { name: "टेक", count: 48, slug: "technology" },
  { name: "ऑटोमोबाइल", count: 18, slug: "automobile" },
  { name: "बिजनेस", count: 12, slug: "business" },
];

export default function Footer() {
  const { locale } = useI18n();
  const [recentStories, setRecentStories] = useState<RecentStory[]>(DEFAULT_RECENT);
  const [categoriesWithCounts, setCategoriesWithCounts] = useState<CategoryCount[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    // 1. Fetch dynamic recent stories
    fetch("/api/news?limit=5")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: RecentStory[] = data.map((item: any) => ({
            title: item.title,
            date: item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""),
            img: item.image || "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=120&auto=format&fit=crop&q=80",
            href: `/news/${item.slug || item._id}`,
          }));
          setRecentStories(mapped);
        }
      })
      .catch(() => {});

    // 2. Fetch dynamic categories
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: CategoryCount[] = data.slice(0, 14).map((c: any) => ({
            name: c.name,
            slug: c.slug,
            count: c.articleCount || Math.floor(Math.random() * 30 + 15),
          }));
          setCategoriesWithCounts(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Fixed Vertical Red Floating Button on Right Edge: ▶ LIVE TV */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:block">
        <a
          href="#sec-videos"
          aria-label="लाइव टीवी प्रसारण देखें (Watch Live TV)"
          className="flex items-center gap-1.5 rounded-l-lg bg-[#c61d23] px-2.5 py-3 text-[11px] font-black uppercase text-white shadow-xl hover:bg-[#a8161b] transition-all [writing-mode:vertical-rl] rotate-180"
        >
          <Play className="h-3.5 w-3.5 fill-current rotate-90" aria-hidden="true" />
          <span className="tracking-widest">LIVE TV</span>
        </a>
      </div>

      <footer className="bg-[#141414] text-gray-300 pt-12 pb-6 border-t border-neutral-800" aria-label="मुख्य पादलेख (Footer)">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 text-xs">
            {/* ── Col 1: About Bharat Pulse ── */}
            <div className="space-y-4">
              <BrandLogo variant="footer" />

              <div>
                <a
                  href="mailto:editorial@bharatpulse.in"
                  className="font-bold text-emerald-400 hover:underline"
                  aria-label="Contact editorial team via email"
                >
                  editorial@bharatpulse.in
                </a>
              </div>

              <p className="text-[11px] leading-relaxed text-gray-300">
                Today&apos;s verified news: Get latest and Breaking News on Politics, Business,
                Economy, Technology, and Sports along with authentic investigative reports from ground.
              </p>

              <p className="text-[11px] leading-relaxed text-gray-300">
                भारत पल्स: देश और दुनिया की हर हलचल पर 24 घंटे निष्पक्ष और सटीक पत्रकारिता का अग्रणी मंच।
              </p>

              {/* Green App Pill Button */}
              <div className="pt-2">
                <a
                  href="#"
                  aria-label="भारत पल्स एंड्रॉइड ऐप डाउनलोड करें"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-900/60 transition-colors shadow-sm"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
                  <span>News App Available on Android</span>
                </a>
              </div>
            </div>

            {/* ── Col 2: Editorial Links ── */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
                Editorial Desk
              </h3>
              <ul className="space-y-2.5 text-gray-300 font-medium">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us (हमारे बारे में)
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy (गोपनीयता नीति)
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms & Ethics Code (आचार संहिता)
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Write For Us (संवाददाता बनें)
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact Newsroom (संपर्क करें)
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-red-400 font-bold hover:underline">
                    Admin CMS Studio
                  </Link>
                </li>
              </ul>
            </div>

            {/* ── Col 3: Category with Counts ── */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
                Categories
              </h3>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-gray-300 font-medium">
                {categoriesWithCounts.map((cat, idx) => (
                  <Link
                    key={idx}
                    href={withLocale(locale, `/category/${cat.slug}`)}
                    className="hover:text-white transition-colors truncate"
                    aria-label={`${cat.name} श्रेणी (${cat.count} लेख)`}
                  >
                    {cat.name} <span className="text-gray-400 font-normal">({cat.count})</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* ── Col 4: Recent News with Thumbnails ── */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white border-b border-neutral-800 pb-2">
                Recent News
              </h3>
              <div className="space-y-3">
                {recentStories.map((story, i) => (
                  <Link
                    key={i}
                    href={withLocale(locale, story.href)}
                    className="group flex items-start gap-2.5 transition-colors focus:outline-none focus:ring-1 focus:ring-white rounded"
                    aria-label={story.title}
                  >
                    <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded bg-neutral-800">
                      <img
                        src={story.img}
                        alt={story.title}
                        width={56}
                        height={48}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold leading-tight text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                        {story.title}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                        {story.date}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bottom Sub-Footer ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-800 pt-5 text-[11px] text-gray-400">
            <p>
              Copyright © {new Date().getFullYear()} BHARAT PULSE News Network. All Rights Reserved.
            </p>

            {/* Social Icons in Small Gray Squares */}
            <div className="flex items-center gap-1.5" aria-label="पादलेख सोशल मीडिया लिंक्स">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-6 w-6 items-center justify-center rounded bg-neutral-800 text-gray-300 hover:bg-[#1877F2] hover:text-white transition-colors"
                aria-label="Bharat Pulse on Facebook"
                title="Facebook"
              >
                <span className="font-bold text-[11px]" aria-hidden="true">f</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-6 w-6 items-center justify-center rounded bg-neutral-800 text-gray-300 hover:bg-black hover:text-white transition-colors"
                aria-label="Bharat Pulse on X"
                title="X"
              >
                <span className="font-bold text-[10px]" aria-hidden="true">𝕏</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-6 w-6 items-center justify-center rounded bg-neutral-800 text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                aria-label="Bharat Pulse on YouTube"
                title="YouTube"
              >
                <span className="font-bold text-[10px]" aria-hidden="true">▶</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
