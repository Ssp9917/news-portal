import type { Locale } from "@/lib/i18n/config";

export function localeToBcp47(locale: Locale): string {
  if (locale === "bn") return "bn-BD";
  if (locale === "hi") return "hi-IN";
  return "en-US";
}
