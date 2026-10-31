import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";
import { headers } from "next/headers";
import "@/style/globals.css";
import StoreProvider from "./StoreProvider";
import { AppThemeProvider } from "@/components/providers/theme-provider";
import ThemeStyleInjector from "@/components/providers/ThemeStyleInjector";
import { getSiteUrl } from "@/lib/site-url";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import connectDB from "@/lib/db";
import GlobalSeo from "@/models/GlobalSeo";
import ThemeConfig from "@/models/ThemeConfig";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-devanagari",
  display: "swap",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif-devanagari",
  display: "swap",
});

const SITE_URL = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Daily Latest News | राष्ट्र की आवाज़";
  let siteDescription =
    "भारत और विश्व की ताज़ा ख़बरें, राजनीति, खेल, तकनीक, व्यापार और विश्लेषण। निष्पक्ष पत्रकारिता का विश्वसनीय मंच।";
  let defaultOg = `${SITE_URL}/og-default.png`;
  let googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "";

  try {
    await connectDB();
    const seo = await GlobalSeo.findOne().sort({ updatedAt: -1 });
    if (seo) {
      if (seo.siteTitle) siteName = seo.siteTitle;
      if (seo.metaDescription) siteDescription = seo.metaDescription;
      if (seo.defaultOgImage) defaultOg = seo.defaultOgImage;
      if (seo.googleVerification) googleVerification = seo.googleVerification;
    }
  } catch {}

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords: [
      "news",
      "latest news",
      "breaking news",
      "Hindi news",
      "India news",
      "Top Briefing",
      "politics",
      "sports",
      "business",
      "technology",
      "entertainment",
      "daily news",
    ],
    authors: [{ name: siteName, url: SITE_URL }],
    creator: siteName,
    publisher: siteName,
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      siteName: siteName,
      title: siteName,
      description: siteDescription,
      url: SITE_URL,
      images: [
        {
          url: defaultOg.startsWith("http") ? defaultOg : `${SITE_URL}${defaultOg}`,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: [defaultOg.startsWith("http") ? defaultOg : `${SITE_URL}${defaultOg}`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: googleVerification,
    },
    alternates: {
      canonical: SITE_URL,
      languages: {
        hi: `${SITE_URL}/hi`,
        en: `${SITE_URL}/en`,
        bn: `${SITE_URL}/bn`,
        "x-default": `${SITE_URL}/hi`,
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const raw = headersList.get("x-locale");
  const locale = raw && isLocale(raw) ? raw : defaultLocale;

  let initialTheme = null;
  let gaId = "G-LDC5ZD9S53";
  let gtmId = "GTM-WDNCFQS5";

  try {
    await connectDB();
    const [themeDoc, seoDoc] = await Promise.all([
      ThemeConfig.findOne().sort({ updatedAt: -1 }).lean(),
      GlobalSeo.findOne().sort({ updatedAt: -1 }).lean(),
    ]);
    if (themeDoc) initialTheme = JSON.parse(JSON.stringify(themeDoc));
    if (seoDoc?.googleAnalyticsId) gaId = seoDoc.googleAnalyticsId;
    if (seoDoc?.googleTagManagerId) gtmId = seoDoc.googleTagManagerId;
  } catch {}

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Daily Latest News",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/${locale}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ThemeStyleInjector initialTheme={initialTheme} />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${notoSans.variable} ${notoSansDevanagari.variable} ${notoSerifDevanagari.variable} min-h-screen antialiased`}
        suppressHydrationWarning
      >
        <AppThemeProvider>
          <StoreProvider>{children}</StoreProvider>
        </AppThemeProvider>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
      </body>
    </html>
  );
}
