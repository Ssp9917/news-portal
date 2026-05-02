import type { Locale } from "@/lib/i18n/config";

type I18nFields = {
  titleI18n?: Record<string, string | undefined>;
  excerptI18n?: Record<string, string | undefined>;
  contentI18n?: Record<string, string | undefined>;
  title?: string;
  excerpt?: string;
  content?: string;
};

function pick(map: Record<string, string | undefined> | undefined, locale: string) {
  const v = map?.[locale];
  return typeof v === "string" && v.trim() ? v : "";
}

export function getLocalizedTitle(news: I18nFields, locale: Locale): string {
  return pick(news.titleI18n, locale) || news.title || "";
}

export function getLocalizedExcerpt(news: I18nFields, locale: Locale): string {
  return pick(news.excerptI18n, locale) || news.excerpt || "";
}

export function getLocalizedContent(news: I18nFields, locale: Locale): string {
  return pick(news.contentI18n, locale) || news.content || "";
}

