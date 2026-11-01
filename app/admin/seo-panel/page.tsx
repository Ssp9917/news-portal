"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import {
  SearchCode,
  Save,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldCheck,
  ExternalLink,
  Globe,
  FileCode,
  Sparkles,
  Share2,
} from "lucide-react";
import type { Role } from "@/lib/auth/rbac";

interface GlobalSeoData {
  siteTitle: string;
  siteTagline: string;
  metaDescription: string;
  defaultOgImage: string;
  faviconUrl: string;
  canonicalBaseUrl: string;
  googleVerification: string;
  bingVerification: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  organizationName: string;
  organizationLogo: string;
  enableGoogleNewsSitemap: boolean;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    telegram?: string;
    whatsapp?: string;
    linkedin?: string;
  };
}

interface SeoAudit {
  healthScore: number;
  totalArticles: number;
  compliantArticles: number;
  issuesCount: number;
  errorsCount: number;
  warningsCount: number;
  issues: {
    type: "warning" | "error" | "info";
    code: string;
    message: string;
    articleId?: string;
    articleTitle?: string;
  }[];
}

export default function SeoControlPanelPage() {
  const [seo, setSeo] = useState<GlobalSeoData>({
    siteTitle: "",
    siteTagline: "",
    metaDescription: "",
    defaultOgImage: "/og-default.png",
    faviconUrl: "/favicon.svg",
    canonicalBaseUrl: "http://localhost:3000",
    googleVerification: "",
    bingVerification: "",
    googleAnalyticsId: "G-LDC5ZD9S53",
    googleTagManagerId: "GTM-WDNCFQS5",
    organizationName: "Daily Latest News",
    organizationLogo: "/favicon.svg",
    enableGoogleNewsSitemap: true,
  });

  const [audit, setAudit] = useState<SeoAudit | null>(null);
  const [activeTab, setActiveTab] = useState<"settings" | "social" | "audit" | "gnews">("settings");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    name?: string;
    role: Role;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }
    fetchCurrentUser(token);
    fetchSeo();
  }, [router]);

  const fetchCurrentUser = async (token: string) => {
    try {
      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch {}
  };

  const fetchSeo = async () => {
    try {
      const res = await fetch("/api/admin/seo");
      if (res.ok) {
        const data = await res.json();
        if (data.seo) setSeo(data.seo);
        if (data.audit) setAudit(data.audit);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(seo),
      });

      if (res.ok) {
        showToast("Global SEO settings updated successfully!");
        fetchSeo();
      } else {
        showToast("Failed to save SEO settings");
      }
    } catch {
      showToast("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#070b14] text-slate-100">
      <AdminNav currentUser={currentUser} />

      <main className="flex-1 w-full min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-950/90 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
                <SearchCode className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
                SEO Control Panel & Health Center
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Manage meta headers, Google Search Console, Analytics 4, XML sitemaps, and automated editorial SEO audits.
            </p>
          </div>

          {/* Quick Technical SEO Links */}
          <div className="flex items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              <FileCode className="h-3.5 w-3.5 text-blue-400" />
              <span>XML Sitemap</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
            <a
              href="/news-sitemap.xml"
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              <span>Google News Sitemap</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
            >
              <span>Robots.txt</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Audit Score Card */}
        {audit && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Overall SEO Health Score
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-4xl font-extrabold font-mono ${
                    audit.healthScore >= 80
                      ? "text-emerald-400"
                      : audit.healthScore >= 60
                      ? "text-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {audit.healthScore}%
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    audit.healthScore >= 80
                      ? "bg-emerald-500"
                      : audit.healthScore >= 60
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${audit.healthScore}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Compliant Published Articles
              </span>
              <p className="mt-2 text-3xl font-extrabold text-white font-mono">
                {audit.compliantArticles}{" "}
                <span className="text-sm font-normal text-slate-400">
                  / {audit.totalArticles}
                </span>
              </p>
              <p className="mt-1 text-xs text-emerald-400">
                Well-optimized headlines & meta descriptions
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Critical SEO Errors
              </span>
              <p className="mt-2 text-3xl font-extrabold text-red-400 font-mono">
                {audit.errorsCount}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Missing descriptions or duplicate headlines
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Optimization Warnings
              </span>
              <p className="mt-2 text-3xl font-extrabold text-amber-400 font-mono">
                {audit.warningsCount}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Short titles or placeholder images
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("settings")}
            className={`border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Global Meta & Analytics
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
              activeTab === "social"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>सोशल मीडिया लिंक्स (Social Links)</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "audit"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Article Health Audit ({audit?.issuesCount || 0})
          </button>
          <button
            onClick={() => setActiveTab("gnews")}
            className={`border-b-2 px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === "gnews"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            Google News Publishing Guide
          </button>
        </div>

        {/* Tab 1: Global Meta & Analytics */}
        {activeTab === "settings" && (
          <form onSubmit={handleSaveSeo} className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-4 text-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Website Meta & Knowledge Graph Schema
              </h3>

              <div>
                <label className="mb-1 block font-semibold text-slate-300">
                  Global Website Title (SERP) *
                </label>
                <input
                  type="text"
                  required
                  value={seo.siteTitle}
                  onChange={(e) => setSeo({ ...seo, siteTitle: e.target.value })}
                  placeholder="Daily Latest News | राष्ट्र की आवाज़"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-300">
                  Site Tagline / Secondary Motto
                </label>
                <input
                  type="text"
                  value={seo.siteTagline}
                  onChange={(e) => setSeo({ ...seo, siteTagline: e.target.value })}
                  placeholder="राष्ट्र की निष्पक्ष, निर्भीक और सटीक आवाज़"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-300">
                  Global Meta Description (120-160 characters recommended)
                </label>
                <textarea
                  rows={3}
                  value={seo.metaDescription}
                  onChange={(e) =>
                    setSeo({ ...seo, metaDescription: e.target.value })
                  }
                  placeholder="भारत और विश्व की ताज़ा ख़बरें..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-white focus:border-blue-500 focus:outline-none"
                />
                <span className="mt-1 block text-right font-mono text-[11px] text-slate-500">
                  {seo.metaDescription?.length || 0} characters
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-300">
                    Canonical Base URL
                  </label>
                  <input
                    type="url"
                    value={seo.canonicalBaseUrl}
                    onChange={(e) =>
                      setSeo({ ...seo, canonicalBaseUrl: e.target.value })
                    }
                    placeholder="https://yournewsdomain.com"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-300">
                    Default Social Share Image (OG Image)
                  </label>
                  <input
                    type="text"
                    value={seo.defaultOgImage}
                    onChange={(e) =>
                      setSeo({ ...seo, defaultOgImage: e.target.value })
                    }
                    placeholder="/og-default.png"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Verification & Analytics IDs */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-4 text-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Search Engine Verification & Analytics
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-semibold text-slate-300">
                    Google Search Console Verification Code
                  </label>
                  <input
                    type="text"
                    value={seo.googleVerification}
                    onChange={(e) =>
                      setSeo({ ...seo, googleVerification: e.target.value })
                    }
                    placeholder="google-site-verification token..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-300">
                    Bing Webmaster Tools Code
                  </label>
                  <input
                    type="text"
                    value={seo.bingVerification}
                    onChange={(e) =>
                      setSeo({ ...seo, bingVerification: e.target.value })
                    }
                    placeholder="msvalidate.01 token..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-300">
                    Google Analytics 4 Measurement ID
                  </label>
                  <input
                    type="text"
                    value={seo.googleAnalyticsId}
                    onChange={(e) =>
                      setSeo({ ...seo, googleAnalyticsId: e.target.value })
                    }
                    placeholder="G-XXXXXX"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-semibold text-slate-300">
                    Google Tag Manager Container ID
                  </label>
                  <input
                    type="text"
                    value={seo.googleTagManagerId}
                    onChange={(e) =>
                      setSeo({ ...seo, googleTagManagerId: e.target.value })
                    }
                    placeholder="GTM-XXXXXX"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seo.enableGoogleNewsSitemap}
                    onChange={(e) =>
                      setSeo({
                        ...seo,
                        enableGoogleNewsSitemap: e.target.checked,
                      })
                    }
                    className="rounded accent-blue-600"
                  />
                  <span className="font-semibold text-white">
                    Enable Dynamic Google News Sitemap at /news-sitemap.xml (last 48h articles)
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving Changes..." : "Save Global SEO Configuration"}</span>
            </button>
          </form>
        )}

        {/* Tab 1.5: Social Media Links Manager */}
        {activeTab === "social" && (
          <form onSubmit={handleSaveSeo} className="space-y-6 max-w-4xl">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl space-y-5 text-xs">
              <div className="border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-blue-400" />
                  <span>आधिकारिक सोशल मीडिया लिंक्स (Official Social Links)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  यहाँ सेट किए गए लिंक्स हेडर, टॉप बार और फुटर में लाइव अपडेट हो जाएंगे।
                </p>
              </div>

              {/* Facebook */}
              <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-bold text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1877F2] text-white text-[11px] font-bold">
                      f
                    </span>
                    <span>Facebook Page URL</span>
                  </label>
                  {seo.socialLinks?.facebook && (
                    <a
                      href={seo.socialLinks.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                    >
                      <span>टेस्ट लिंक</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={seo.socialLinks?.facebook || ""}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      socialLinks: { ...seo.socialLinks, facebook: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/bharatpulse"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Twitter / X */}
              <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-bold text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white border border-white/20 text-[10px] font-bold">
                      𝕏
                    </span>
                    <span>Twitter / X Profile URL</span>
                  </label>
                  {seo.socialLinks?.twitter && (
                    <a
                      href={seo.socialLinks.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                    >
                      <span>टेस्ट लिंक</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={seo.socialLinks?.twitter || ""}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      socialLinks: { ...seo.socialLinks, twitter: e.target.value },
                    })
                  }
                  placeholder="https://x.com/bharatpulse"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Instagram */}
              <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-bold text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white text-[10px] font-bold">
                      📷
                    </span>
                    <span>Instagram Profile URL</span>
                  </label>
                  {seo.socialLinks?.instagram && (
                    <a
                      href={seo.socialLinks.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-pink-400 hover:underline"
                    >
                      <span>टेस्ट लिंक</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={seo.socialLinks?.instagram || ""}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      socialLinks: { ...seo.socialLinks, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/bharatpulse"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 font-mono text-white focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* YouTube Channel */}
              <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-bold text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">
                      ▶
                    </span>
                    <span>YouTube Channel URL</span>
                  </label>
                  {seo.socialLinks?.youtube && (
                    <a
                      href={seo.socialLinks.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-red-400 hover:underline"
                    >
                      <span>टेस्ट लिंक</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={seo.socialLinks?.youtube || ""}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      socialLinks: { ...seo.socialLinks, youtube: e.target.value },
                    })
                  }
                  placeholder="https://youtube.com/@bharatpulse"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 font-mono text-white focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* WhatsApp Community / Channel */}
              <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-bold text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      💬
                    </span>
                    <span>WhatsApp Channel / Alerts Link</span>
                  </label>
                  {seo.socialLinks?.whatsapp && (
                    <a
                      href={seo.socialLinks.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline"
                    >
                      <span>टेस्ट लिंक</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={seo.socialLinks?.whatsapp || ""}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      socialLinks: { ...seo.socialLinks, whatsapp: e.target.value },
                    })
                  }
                  placeholder="https://whatsapp.com/channel/0029Va..."
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 font-mono text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Telegram Channel */}
              <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-bold text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#229ED9] text-white text-[10px] font-bold">
                      ✈
                    </span>
                    <span>Telegram News Channel URL</span>
                  </label>
                  {seo.socialLinks?.telegram && (
                    <a
                      href={seo.socialLinks.telegram}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                    >
                      <span>टेस्ट लिंक</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={seo.socialLinks?.telegram || ""}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      socialLinks: { ...seo.socialLinks, telegram: e.target.value },
                    })
                  }
                  placeholder="https://t.me/bharatpulsenews"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 font-mono text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* LinkedIn */}
              <div className="rounded-xl border border-white/5 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 font-bold text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0A66C2] text-white text-[10px] font-bold">
                      in
                    </span>
                    <span>LinkedIn Company Profile URL</span>
                  </label>
                  {seo.socialLinks?.linkedin && (
                    <a
                      href={seo.socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                    >
                      <span>टेस्ट लिंक</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={seo.socialLinks?.linkedin || ""}
                  onChange={(e) =>
                    setSeo({
                      ...seo,
                      socialLinks: { ...seo.socialLinks, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/company/bharatpulse"
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 font-mono text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "सेव किया जा रहा है..." : "सोशल मीडिया लिंक्स सेव करें (Save Social Links)"}</span>
            </button>
          </form>
        )}

        {/* Tab 2: Article SEO Health Audit */}
        {activeTab === "audit" && audit && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Severity</th>
                    <th className="py-3 px-4 font-semibold">Issue Code</th>
                    <th className="py-3 px-4 font-semibold">Article</th>
                    <th className="py-3 px-4 font-semibold">Recommendation</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {audit.issues.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                        <span className="text-sm font-semibold text-white">
                          Clean SEO Audit! No critical errors detected.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    audit.issues.map((iss, i) => (
                      <tr key={i} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4">
                          {iss.type === "error" ? (
                            <span className="flex items-center gap-1 text-red-400 font-bold text-[10px] uppercase">
                              <AlertCircle className="h-3.5 w-3.5" /> Error
                            </span>
                          ) : iss.type === "warning" ? (
                            <span className="flex items-center gap-1 text-amber-400 font-bold text-[10px] uppercase">
                              <AlertTriangle className="h-3.5 w-3.5" /> Warning
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-cyan-400 font-bold text-[10px] uppercase">
                              <Info className="h-3.5 w-3.5" /> Info
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400">
                          {iss.code}
                        </td>
                        <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                          {iss.articleTitle || "—"}
                        </td>
                        <td className="py-3 px-4 text-slate-300 max-w-sm">
                          {iss.message}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {iss.articleId && (
                            <button
                              onClick={() =>
                                router.push(`/admin/edit-news?id=${iss.articleId}`)
                              }
                              className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-blue-400 hover:bg-white/10"
                            >
                              Fix in Editor
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Google News Publishing Guide */}
        {activeTab === "gnews" && (
          <div className="max-w-4xl space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="text-base font-bold text-white mb-2">
                Google News Publishing Guidelines & Compliance
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Google News inclusion is algorithmic, determined by content authority,
                originality, transparent authorship, and technical schema correctness.
              </p>

              <div className="mt-5 space-y-3 text-xs">
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Dynamic Google News XML Sitemap</h4>
                    <p className="text-slate-300 mt-0.5">
                      Implemented at <code className="text-emerald-300 font-mono">/news-sitemap.xml</code>.
                      Filters stories published within the past 48 hours according to Google News standard schema.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-950/20 p-3.5">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Structured Data (NewsArticle Schema)</h4>
                    <p className="text-slate-300 mt-0.5">
                      Every article page automatically renders JSON-LD structured data with author,
                      publisher, datePublished, dateModified, and image objects.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-950/20 p-3.5">
                  <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white">Editorial Transparency Policy</h4>
                    <p className="text-slate-300 mt-0.5">
                      Ensure every article has an identifiable byline (author name), clear publication dates,
                      contact information, and corrections/editorial policies listed in the footer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
