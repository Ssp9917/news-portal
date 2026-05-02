import type { Messages } from "@/lib/i18n/get-dictionary";

export function pickMessage(dict: Messages, key: string): string {
  const v = key.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object" && k in (acc as object)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, dict);
  return typeof v === "string" ? v : key;
}
