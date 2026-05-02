export const locales = ["bn", "en", "hi"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "bn";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
