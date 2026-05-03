import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getSiteUrl } from "@/lib/site-url";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const site = getSiteUrl();

  return {
    title: dict.meta.defaultTitle,
    description: dict.meta.defaultDescription,
    alternates: {
      canonical: `${site}/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${site}/${l}`])
      ) as Record<string, string>,
    },
    openGraph: {
      locale: locale === "bn" ? "bn_BD" : locale === "hi" ? "hi_IN" : "en_US",
      url: `${site}/${locale}`,
      title: dict.meta.defaultTitle,
      description: dict.meta.defaultDescription,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dictionary = await getDictionary(locale);

  const fontClass = locale === "bn" ? "font-anek" : "Georgia";

  return (
    <I18nProvider locale={locale} dictionary={dictionary as Record<string, unknown>}>
      <div className={fontClass}>{children}</div>
    </I18nProvider>
  );
}
