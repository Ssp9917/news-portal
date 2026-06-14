import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans, Noto_Sans_Devanagari, Noto_Serif_Devanagari } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { GoogleTagManager } from "@next/third-parties/google";
import Script from "next/script";
import { headers } from "next/headers";
import "@/style/globals.css";
import StoreProvider from "./StoreProvider";
import { AppThemeProvider } from "@/components/providers/theme-provider";
import { getSiteUrl } from "@/lib/site-url";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

const banglaFont = localFont({
  src: "./fonts/AnekBangla.ttf",
  variable: "--font-anekBangla",
  display: "swap",
});

const notoSans = Noto_Sans({
  subsets: ["latin", "bengali", "devanagari"],
  variable: "--font-noto-sans",
  display: "swap",
});

// ✅ ADD: Hindi body font
const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-devanagari",
  display: "swap",
});

// ✅ ADD: Hindi headline font
const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "700"],
  variable: "--font-noto-serif-devanagari",
  display: "swap",
});

const SITE_NAME = "Daily Latest News";
const SITE_DESCRIPTION =
  "Stay informed with the latest breaking news, top stories, and in-depth reporting across politics, sports, business, technology, and entertainment.";
const SITE_URL = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,

  keywords: [
    "news", "latest news", "breaking news", "Bangladesh news",
    "Hindi news", "Bengali news", "politics", "sports", "business",
    "technology", "entertainment", "daily news",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,

  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },

  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@dailylatestnews",
    creator: "@dailylatestnews",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-default.png`],
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
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },

  alternates: {
    canonical: SITE_URL,
    languages: {
      bn: `${SITE_URL}/bn`,
      en: `${SITE_URL}/en`,
      hi: `${SITE_URL}/hi`,
      "x-default": `${SITE_URL}/bn`,
    },
  },
};

// JSON-LD: WebSite structured data
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/en/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/favicon.svg`,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const raw = headersList.get("x-locale");
  const locale = raw && isLocale(raw) ? raw : defaultLocale;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${notoSansDevanagari.variable} ${notoSerifDevanagari.variable} min-h-screen antialiased`}
        style={{ fontFamily: "Georgia, var(--font-noto-sans), 'Times New Roman', serif" }}
        suppressHydrationWarning={true}
      >
        <AppThemeProvider>
          <StoreProvider>{children}</StoreProvider>
        </AppThemeProvider>
        <GoogleAnalytics gaId="G-LDC5ZD9S53" />
        <GoogleTagManager gtmId="GTM-WDNCFQS5" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5098961807637378"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
