import type { Locale } from "./config";
import bn from "@/messages/bn.json";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";

const dictionaries = { bn, en, hi } satisfies Record<
  Locale,
  typeof bn
>;

export async function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.bn;
}

export type Messages = typeof bn;
