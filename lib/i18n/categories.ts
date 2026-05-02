import type { Locale } from "./config";

/** URL segment (English slug) ↔ category value stored on news documents (Bangla) */
export const DB_CATEGORY_BY_SLUG: Record<string, string> = {
  national: "দেশের খবর",
  politics: "রাজনীতি",
  sports: "খেলাধুলা",
  technology: "প্রযুক্তি",
  world: "বিশ্ব",
  business: "বাণিজ্য",
  entertainment: "বিনোদন",
  health: "স্বাস্থ্য",
  education: "শিক্ষা",
  crime: "অপরাধ",
};

export type CategorySlug = keyof typeof DB_CATEGORY_BY_SLUG;

export const CATEGORY_SLUGS = Object.keys(
  DB_CATEGORY_BY_SLUG
) as CategorySlug[];

/** Navbar order: home + category slugs */
export const NAV_CATEGORY_SLUGS: readonly (
  | "home"
  | CategorySlug
)[] = [
  "home",
  "national",
  "politics",
  "sports",
  "technology",
  "world",
  "business",
  "entertainment",
  "health",
  "education",
  "crime",
];

const SLUG_BY_DB_CATEGORY: Record<string, CategorySlug> = Object.fromEntries(
  Object.entries(DB_CATEGORY_BY_SLUG).map(([slug, bn]) => [bn, slug as CategorySlug])
) as Record<string, CategorySlug>;

export function getDbCategoryFromSlug(slug: string): string | null {
  return DB_CATEGORY_BY_SLUG[slug] ?? null;
}

export function getSlugFromDbCategory(dbCategory: string): CategorySlug | null {
  return SLUG_BY_DB_CATEGORY[dbCategory] ?? null;
}

/** Display label for a DB category in the current UI language */
export function categoryLabelForLocale(
  dbCategory: string,
  locale: Locale,
  t: (key: string) => string
): string {
  const slug = getSlugFromDbCategory(dbCategory);
  if (slug) return t(`categories.${slug}`);
  return dbCategory;
}
