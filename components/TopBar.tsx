"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider";
import { useAuth } from "@/components/providers/AuthProvider";
import LocaleSwitcher from "./LocaleSwitcher";
import ThemeToggle from "./ThemeToggle";

export default function TopBar() {
  const { locale } = useI18n();
  const { user, openAuthModal } = useAuth();
  const [dateStr, setDateStr] = useState("Sat, Oct 31, 2026");
  const [timeStr, setTimeStr] = useState("10:30 PM");
  const [socials, setSocials] = useState({
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    youtube: "https://youtube.com",
    whatsapp: "",
    telegram: "",
  });

  useEffect(() => {
    fetch("/api/settings/social")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.socialLinks) {
          setSocials((prev) => ({ ...prev, ...data.socialLinks }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setDateStr(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="border-b border-gray-200 bg-white text-gray-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200 text-[11px] font-medium"
      aria-label="शीर्ष सूचना पट्टी"
    >
      <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 flex-wrap gap-2">
        {/* Left: Date, Time & Location */}
        <div className="flex items-center gap-1.5 text-gray-800 dark:text-neutral-200">
          <span className="font-semibold">{dateStr}</span>
          <span className="text-gray-400 dark:text-neutral-600">|</span>
          <span className="font-medium">{timeStr}</span>
          <span className="hidden sm:inline text-gray-400 dark:text-neutral-600">|</span>
          <span className="hidden sm:inline text-gray-600 dark:text-neutral-400 font-medium">
            Location Updated
          </span>
        </div>

        {/* Right: Login/SignUp + Social Media Circular Icons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="flex items-center gap-1.5 hover:text-[#c61d23] text-gray-800 dark:text-neutral-200 transition-colors font-bold"
                aria-label="User Profile"
              >
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#c61d23] text-white text-[9px] font-black">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </span>
                <span className="truncate max-w-[120px]">{user.name || "खाता (Account)"}</span>
              </Link>
              {user.isStaff && (
                <Link
                  href="/admin"
                  className="rounded bg-red-100 dark:bg-red-950/60 px-1.5 py-0.5 text-[9px] font-black text-[#c61d23] dark:text-red-400 hover:underline"
                >
                  ADMIN
                </Link>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="hover:text-[#c61d23] text-gray-800 dark:text-neutral-200 transition-colors font-bold cursor-pointer"
              aria-label="Login or Sign Up"
            >
              Login / Sign Up
            </button>
          )}

          <span className="text-gray-300 dark:text-neutral-700" aria-hidden="true">
            |
          </span>

          {/* Social circular icons */}
          <div className="flex items-center gap-1.5" aria-label="सोशल मीडिया लिंक्स">
            {/* Facebook */}
            <a
              href={socials.facebook || "https://facebook.com"}
              target="_blank"
              rel="noreferrer"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877F2] text-white hover:opacity-90 transition-opacity"
              aria-label="Bharat Pulse on Facebook"
              title="Facebook"
            >
              <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* Twitter / X */}
            <a
              href={socials.twitter || "https://twitter.com"}
              target="_blank"
              rel="noreferrer"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-black text-white hover:opacity-90 transition-opacity dark:bg-white dark:text-black"
              aria-label="Bharat Pulse on X"
              title="X"
            >
              <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href={socials.instagram || "https://instagram.com"}
              target="_blank"
              rel="noreferrer"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white hover:opacity-90 transition-opacity"
              aria-label="Bharat Pulse on Instagram"
              title="Instagram"
            >
              <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href={socials.youtube || "https://youtube.com"}
              target="_blank"
              rel="noreferrer"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF0000] text-white hover:opacity-90 transition-opacity"
              aria-label="Bharat Pulse on YouTube"
              title="YouTube"
            >
              <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            {/* WhatsApp Channel if configured */}
            {socials.whatsapp && (
              <a
                href={socials.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white hover:opacity-90 transition-opacity text-[10px]"
                aria-label="Bharat Pulse on WhatsApp Channel"
                title="WhatsApp Channel"
              >
                💬
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
