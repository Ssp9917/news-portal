import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Daily Latest News",
    template: "%s | Daily Latest News",
  },
  description: "Latest news across categories with a fast, responsive reading experience.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Daily Latest News",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
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
      <body
        className={`${banglaFont.variable} ${notoSans.variable} min-h-screen antialiased`}
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
