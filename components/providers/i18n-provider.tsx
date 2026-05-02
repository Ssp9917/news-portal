"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

type Dict = Record<string, unknown>;

function resolveKey(obj: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof value === "string" ? value : path;
}

type I18nContextValue = {
  locale: string;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: string;
  dictionary: Dict;
  children: ReactNode;
}) {
  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string) => resolveKey(dictionary, key);
    return { locale, t };
  }, [locale, dictionary]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useOptionalI18n() {
  return useContext(I18nContext);
}
