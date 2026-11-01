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
import { AuthProvider } from "@/components/providers/AuthProvider";
import AuthModal from "@/components/auth/AuthModal";
import OfflineBanner from "@/components/offline/OfflineBanner";
import PwaRegistrar from "@/components/providers/PwaRegistrar";
import { getSiteUrl } from "@/lib/site-url";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import connectDB from "@/lib/db";
import GlobalSeo from "@/models/GlobalSeo";
import ThemeConfig from "@/models/ThemeConfig";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
  preload: true,
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-devanagari",
  display: "swap",
  preload: true,
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif-devanagari",
  display: "swap",
  preload: false,
});

const SITE_URL = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "Bharat Pulse | भारत पल्स - राष्ट्रीय व अंतरराष्ट्रीय समाचार";
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
      "Bharat Pulse",
      "भारत पल्स",
      "news",
      "latest news",
      "breaking news",
      "Hindi news",
      "India news",
      "politics",
      "sports",
      "business",
      "technology",
      "entertainment",
      "daily news",
    ],
    authors: [{ name: "Bharat Pulse Media Network", url: SITE_URL }],
    creator: "Bharat Pulse Media Network",
    publisher: "Bharat Pulse Media Network",
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
  let gaId = "";
  let gtmId = "";

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
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Bharat Pulse",
        alternateName: "भारत पल्स",
        url: SITE_URL,
        description: "भारत और विश्व की ताज़ा ख़बरें, राजनीति, खेल, तकनीक, व्यापार और विश्लेषण।",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/${locale}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "NewsMediaOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: "Bharat Pulse Media Network",
        alternateName: "भारत पल्स",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/favicon.svg`,
          width: 512,
          height: 512,
        },
        sameAs: [
          "https://facebook.com",
          "https://twitter.com",
          "https://youtube.com",
          "https://instagram.com",
        ],
        contactPoint: {
          "@type": "ContactPoint",
          email: "editorial@bharatpulse.in",
          contactType: "newsroom",
        },
      },
    ],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c61d23" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bharat Pulse" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://placehold.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://placehold.co" />
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
        {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#c61d23] focus:text-white focus:rounded-md focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white font-bold text-xs"
        >
          मुख्य सामग्री पर जाएं (Skip to main content)
        </a>

        <AppThemeProvider>
          <AuthProvider>
            <OfflineBanner />
            <PwaRegistrar />
            <StoreProvider>{children}</StoreProvider>
            <AuthModal />
          </AuthProvider>
        </AppThemeProvider>
        {process.env.NODE_ENV === "production" && gaId && <GoogleAnalytics gaId={gaId} />}
        {process.env.NODE_ENV === "production" && gtmId && <GoogleTagManager gtmId={gtmId} />}
      </body>
    </html>
  );
}
