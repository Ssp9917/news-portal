"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/components/providers/i18n-provider";

const labels: Record<Locale, string> = {
  bn: "বাংলা",
  en: "English",
  hi: "हिन्दी",
};

export default function LocaleSwitcher() {
  const { locale: current } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const restPath = (() => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) return "/";
    const first = parts[0];
    if (locales.includes(first as Locale)) {
      return "/" + parts.slice(1).join("/") || "/";
    }
    return pathname;
  })();

  const handleChange = (next: Locale) => {
    const suffix = restPath === "/" ? "" : restPath;
    router.push(`/${next}${suffix}`);
  };

  return (
    <label className="flex items-center gap-2 text-white/90">
      <select
        aria-label={labels[current as Locale] ?? "Language"}
        value={current}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className="rounded-md border border-gray-600/50 bg-[#1f2937] px-2 py-1 text-xs text-white outline-none focus:ring-2 focus:ring-[#D32F2F]"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {labels[loc]}
          </option>
        ))}
      </select>
    </label>
  );
}
