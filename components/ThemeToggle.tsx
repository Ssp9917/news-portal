"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/providers/i18n-provider";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme, theme } = useTheme();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-transparent" />
    );
  }

  const cycle = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const Icon =
    theme === "system"
      ? Monitor
      : resolvedTheme === "dark"
        ? Moon
        : Sun;

  const label =
    theme === "system"
      ? t("nav.themeSystem")
      : resolvedTheme === "dark"
        ? t("nav.themeDark")
        : t("nav.themeLight");

  return (
    <button
      type="button"
      onClick={cycle}
      title={`${t("nav.theme")}: ${label}`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-600/40 bg-white/5 text-white hover:bg-white/10 dark:border-white/15 dark:bg-white/5"
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
