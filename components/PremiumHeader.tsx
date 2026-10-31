"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { withLocale } from "@/lib/i18n/paths";
import SearchModal from "./SearchModal";
import BrandLogo from "./BrandLogo";

interface CategoryItem {
  name: string;
  nameI18n?: {
    hi?: string;
    en?: string;
    bn?: string;
  };
  slug: string;
}

export default function PremiumHeader() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const pathname = usePathname();
  const { locale } = useI18n();

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { name: "भारत", slug: "national" },
    { name: "शिक्षा", slug: "education" },
    { name: "दुनिया", slug: "world" },
    { name: "बाजार", slug: "business" },
    { name: "खेल", slug: "sports" },
    { name: "ऑटोमोबाइल", slug: "automobile" },
    { name: "मनोरंजन", slug: "entertainment" },
  ];

  return (
    <>
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      <header className="sticky top-0 z-40 w-full bg-[#c61d23] text-white shadow-md">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex h-15 items-center justify-between gap-3 py-1">
            {/* Left: Mobile Toggle & Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-white hover:bg-black/15 lg:hidden cursor-pointer"
                aria-label={mobileMenuOpen ? "मेनू बंद करें" : "नेविगेशन मेनू खोलें"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-drawer"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Brand Logo Component */}
              <BrandLogo variant="header" />
            </div>

            {/* Middle: Horizontal Navigation Links */}
            <nav
              className="hidden lg:flex items-center space-x-0.5 text-[13px] font-bold"
              aria-label="मुख्य नेविगेशन"
            >
              {/* Home */}
              <Link
                href={withLocale(locale, "/")}
                className={`rounded px-3 py-1.5 transition-colors ${
                  pathname === withLocale(locale, "/")
                    ? "bg-[#9a1418] text-white shadow-inner"
                    : "text-white hover:bg-[#b0181d]"
                }`}
              >
                Home
              </Link>

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                  onMouseEnter={() => setCategoriesDropdownOpen(true)}
                  className="flex items-center gap-1 rounded px-3 py-1.5 text-white hover:bg-[#b0181d] transition-colors cursor-pointer"
                  aria-expanded={categoriesDropdownOpen}
                  aria-haspopup="true"
                  aria-label="श्रेणियां सूची"
                >
                  <span>Categories</span>
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                {categoriesDropdownOpen && (
                  <div
                    onMouseLeave={() => setCategoriesDropdownOpen(false)}
                    className="absolute top-full left-0 mt-1 w-48 rounded-xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-2 shadow-2xl text-xs font-semibold text-gray-800 dark:text-neutral-200 z-50 animate-in fade-in"
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={withLocale(locale, `/category/${cat.slug}`)}
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-red-50 dark:hover:bg-neutral-800 hover:text-[#c61d23] transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Hindi category nav items */}
              {navItems.map((item) => {
                const href = withLocale(locale, `/category/${item.slug}`);
                const isActive = pathname.includes(`/category/${item.slug}`);
                return (
                  <Link
                    key={item.slug}
                    href={href}
                    className={`rounded px-3 py-1.5 transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-[#9a1418] text-white shadow-inner"
                        : "text-white hover:bg-[#b0181d]"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search Icon + Subscribe Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSearchModalOpen(true)}
                title="Search"
                aria-label="समाचार खोजें"
                className="p-2 text-white hover:bg-black/15 rounded-lg transition-colors cursor-pointer"
              >
                <Search className="h-4.5 w-4.5" />
              </button>

              <a
                href="#newsletter-subscribe"
                aria-label="न्यूज़लेटर सब्सक्राइब करें"
                className="flex items-center gap-1.5 rounded-full border border-white/80 bg-[#9a1418] hover:bg-[#831114] px-3.5 py-1 text-xs font-bold text-white transition-all shadow-sm"
              >
                <AlertCircle className="h-3.5 w-3.5 fill-current text-amber-300" aria-hidden="true" />
                <span className="tracking-wide">SUBSCRIBE</span>
              </a>
            </div>
          </div>
        </div>

        {/* Mobile Nav Menu Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="lg:hidden border-t border-red-700 bg-[#b0181d] px-4 py-4 text-xs font-bold animate-in slide-in-from-top-2"
          >
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={withLocale(locale, "/")}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg bg-[#9a1418] p-3 text-white text-center flex items-center justify-center min-h-[44px]"
              >
                Home (होम)
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.slug}
                  href={withLocale(locale, `/category/${item.slug}`)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-white/10 p-3 text-white hover:bg-white/20 text-center flex items-center justify-center min-h-[44px]"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
