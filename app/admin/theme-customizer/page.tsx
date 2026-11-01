"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import {
  Palette,
  Sparkles,
  Save,
  RotateCcw,
  Sun,
  Moon,
  CheckCircle2,
  Sliders,
  Eye,
  Type,
  Layers,
  Flame,
} from "lucide-react";
import type { Role } from "@/lib/auth/rbac";

interface ThemeState {
  preset: string;
  mode: "dark" | "light" | "system";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkBg: string;
  lightBg: string;
  cardStyle: "glass" | "modern-flat" | "editorial-bordered" | "glow";
  borderRadius: string;
  glassBlur: string;
  glassOpacity: number;
  headingFont: "serif" | "sans" | "display";
  bodyFont: "sans" | "serif";
  baseFontSize: string;
  containerWidth: string;
  sectionSpacing: string;
  enableAnimations: boolean;
  isPublished: boolean;
}

const DEFAULT_THEME: ThemeState = {
  preset: "electric-midnight",
  mode: "dark",
  primaryColor: "#2563EB",
  secondaryColor: "#7C3AED",
  accentColor: "#06B6D4",
  darkBg: "#030712",
  lightBg: "#F8FAFC",
  cardStyle: "glass",
  borderRadius: "1rem",
  glassBlur: "16px",
  glassOpacity: 0.65,
  headingFont: "serif",
  bodyFont: "sans",
  baseFontSize: "16px",
  containerWidth: "1280px",
  sectionSpacing: "3.5rem",
  enableAnimations: true,
  isPublished: true,
};

const PRESETS = [
  {
    id: "electric-midnight",
    name: "Electric Midnight",
    desc: "Futuristic deep space navy with glowing cyan & royal violet",
    primary: "#2563EB",
    secondary: "#7C3AED",
    accent: "#06B6D4",
    darkBg: "#030712",
    lightBg: "#F8FAFC",
  },
  {
    id: "royal-editorial",
    name: "Royal Editorial",
    desc: "High-society prestigious publication with deep purple accents",
    primary: "#7C3AED",
    secondary: "#C026D3",
    accent: "#F59E0B",
    darkBg: "#090514",
    lightBg: "#FAF5FF",
  },
  {
    id: "bbc-editorial-red",
    name: "BBC Modern Red",
    desc: "Authoritative global news agency crimson & crisp white",
    primary: "#DC2626",
    secondary: "#E11D48",
    accent: "#F97316",
    darkBg: "#0B0F19",
    lightBg: "#FFFFFF",
  },
  {
    id: "cyber-emerald",
    name: "Emerald Horizon",
    desc: "Tech and economy-focused obsidian and electric emerald",
    primary: "#059669",
    secondary: "#0D9488",
    accent: "#10B981",
    darkBg: "#022C22",
    lightBg: "#F0FDF4",
  },
  {
    id: "guardian-navy",
    name: "The Guardian Navy",
    desc: "Classic British broadsheet editorial navy and warm amber",
    primary: "#1D4ED8",
    secondary: "#047857",
    accent: "#EA580C",
    darkBg: "#051124",
    lightBg: "#FDFBF7",
  },
];

export default function ThemeCustomizerPage() {
  const [theme, setTheme] = useState<ThemeState>(DEFAULT_THEME);
  const [previewMode, setPreviewMode] = useState<"dark" | "light">("dark");
  const [loading, setLoading] = useState(true);
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
    fetchTheme();
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

  const fetchTheme = async () => {
    try {
      const res = await fetch("/api/admin/theme");
      if (res.ok) {
        const data = await res.json();
        if (data && data._id) {
          setTheme((prev) => ({ ...prev, ...data }));
          setPreviewMode(data.mode === "light" ? "light" : "dark");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (preset: (typeof PRESETS)[0]) => {
    const updated = {
      ...theme,
      preset: preset.id,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      accentColor: preset.accent,
      darkBg: preset.darkBg,
      lightBg: preset.lightBg,
    };
    setTheme(updated);
    broadcastPreview(updated);
  };

  const broadcastPreview = (state: ThemeState) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("dl-theme-preview", { detail: state })
      );
    }
  };

  const updateField = <K extends keyof ThemeState>(
    field: K,
    val: ThemeState[K]
  ) => {
    const updated = { ...theme, [field]: val };
    setTheme(updated);
    broadcastPreview(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(theme),
      });
      if (res.ok) {
        showToast("Theme settings published globally!");
      } else {
        const err = await res.json();
        showToast(err.message || "Could not save theme", true);
      }
    } catch {
      showToast("Network error saving theme", true);
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg: string, isError = false) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#070b14] text-slate-100">
      <AdminNav currentUser={currentUser} />

      <main className="flex-1 w-full min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-blue-500/30 bg-blue-950/90 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="h-5 w-5 text-blue-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Palette className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Live Theme Customizer
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Personalize glassmorphism blur, colors, cards, and typography with real-time preview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTheme(DEFAULT_THEME);
                broadcastPreview(DEFAULT_THEME);
                showToast("Reset to default configuration");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Publishing..." : "Save & Publish Theme"}</span>
            </button>
          </div>
        </div>

        {/* Two-Column Editor Layout: Controls on left, Live Preview on right */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Controls Column */}
          <div className="space-y-6 xl:col-span-7">
            {/* 1. Theme Presets */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span>Curated Editorial Presets</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PRESETS.map((p) => {
                  const isSelected = theme.preset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePresetSelect(p)}
                      className={`group relative flex flex-col rounded-xl border p-4 text-left transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-950/40 shadow-lg shadow-blue-500/20"
                          : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{p.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: p.primary }}
                          />
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: p.secondary }}
                          />
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm"
                            style={{ backgroundColor: p.accent }}
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Color Direction */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                <Palette className="h-4 w-4 text-cyan-400" />
                <span>Editorial Colors & Accents</span>
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Primary Color */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => updateField("primaryColor", e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"
                    />
                    <input
                      type="text"
                      value={theme.primaryColor}
                      onChange={(e) => updateField("primaryColor", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                    Secondary Gradient
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => updateField("secondaryColor", e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"
                    />
                    <input
                      type="text"
                      value={theme.secondaryColor}
                      onChange={(e) => updateField("secondaryColor", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                    Accent Indicator
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => updateField("accentColor", e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"
                    />
                    <input
                      type="text"
                      value={theme.accentColor}
                      onChange={(e) => updateField("accentColor", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Background Overrides */}
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-white/10">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                    Dark Mode Canvas Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.darkBg}
                      onChange={(e) => updateField("darkBg", e.target.value)}
                      className="h-9 w-11 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"
                    />
                    <input
                      type="text"
                      value={theme.darkBg}
                      onChange={(e) => updateField("darkBg", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-400">
                    Light Mode Canvas Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.lightBg}
                      onChange={(e) => updateField("lightBg", e.target.value)}
                      className="h-9 w-11 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"
                    />
                    <input
                      type="text"
                      value={theme.lightBg}
                      onChange={(e) => updateField("lightBg", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Glassmorphism & Card Styling */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                <Layers className="h-4 w-4 text-purple-400" />
                <span>Glassmorphism & Card Treatment</span>
              </h3>

              {/* Card Style Selector */}
              <div className="mb-5">
                <label className="mb-2 block text-xs font-semibold text-slate-400">
                  Card Style Architecture
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { id: "glass", name: "Frosted Glass" },
                    { id: "modern-flat", name: "Modern Flat" },
                    { id: "editorial-bordered", name: "Classic Border" },
                    { id: "glow", name: "Neon Glow" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() =>
                        updateField("cardStyle", style.id as ThemeState["cardStyle"])
                      }
                      className={`rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all ${
                        theme.cardStyle === style.id
                          ? "border-blue-500 bg-blue-600/20 text-white shadow-md shadow-blue-500/20"
                          : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders: Glass Blur, Opacity, Border Radius */}
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>Backdrop Blur Filter</span>
                    <span className="font-mono text-blue-400">{theme.glassBlur}</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    step="2"
                    value={parseInt(theme.glassBlur) || 16}
                    onChange={(e) => updateField("glassBlur", `${e.target.value}px`)}
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>Glass Card Opacity</span>
                    <span className="font-mono text-blue-400">
                      {Math.round(theme.glassOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="0.95"
                    step="0.05"
                    value={theme.glassOpacity}
                    onChange={(e) =>
                      updateField("glassOpacity", parseFloat(e.target.value))
                    }
                    className="w-full accent-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>Card Corner Radius</span>
                    <span className="font-mono text-blue-400">{theme.borderRadius}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.25"
                    value={parseFloat(theme.borderRadius) || 1}
                    onChange={(e) =>
                      updateField("borderRadius", `${e.target.value}rem`)
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 4. Typography & Spacing */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-300">
                <Type className="h-4 w-4 text-emerald-400" />
                <span>Editorial Typography & Layout</span>
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-400">
                    Headlines Font Style
                  </label>
                  <select
                    value={theme.headingFont}
                    onChange={(e) =>
                      updateField(
                        "headingFont",
                        e.target.value as ThemeState["headingFont"]
                      )
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="serif">Noto Serif Devanagari / Editorial Serif</option>
                    <option value="sans">Noto Sans / Modern Geometrics</option>
                    <option value="display">High-Contrast Condensed Display</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-400">
                    Section Vertical Spacing
                  </label>
                  <select
                    value={theme.sectionSpacing}
                    onChange={(e) => updateField("sectionSpacing", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="2.5rem">Compact (2.5rem)</option>
                    <option value="3.5rem">Standard Magazine (3.5rem)</option>
                    <option value="5rem">Generous Luxury (5rem)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <span className="text-sm font-semibold text-white">Micro-Animations</span>
                  <p className="text-xs text-slate-400">
                    Card elevations, image hover zooms, and smooth ticker transitions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateField("enableAnimations", !theme.enableAnimations)
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    theme.enableAnimations ? "bg-blue-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      theme.enableAnimations ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview */}
          <div className="xl:col-span-5">
            <div className="sticky top-6 rounded-2xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-2xl shadow-2xl">
              {/* Preview Header & Light/Dark Switcher */}
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Live Component Preview
                  </span>
                </div>
                <div className="flex items-center rounded-lg border border-white/10 bg-white/5 p-1">
                  <button
                    onClick={() => setPreviewMode("dark")}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      previewMode === "dark"
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Moon className="h-3 w-3" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => setPreviewMode("light")}
                    className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      previewMode === "light"
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sun className="h-3 w-3" />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Mockup Viewport */}
              <div
                className="overflow-hidden rounded-xl border border-white/10 p-4 transition-colors"
                style={{
                  backgroundColor:
                    previewMode === "dark" ? theme.darkBg : theme.lightBg,
                  color: previewMode === "dark" ? "#f8fafc" : "#0f172a",
                }}
              >
                {/* Mock Header */}
                <div
                  className="mb-4 flex items-center justify-between rounded-lg px-3 py-2 border transition-all"
                  style={{
                    backgroundColor:
                      previewMode === "dark"
                        ? `rgba(15, 23, 42, ${theme.glassOpacity})`
                        : `rgba(255, 255, 255, ${theme.glassOpacity})`,
                    backdropFilter: `blur(${theme.glassBlur})`,
                    borderColor:
                      previewMode === "dark"
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(0, 0, 0, 0.08)",
                    borderRadius: theme.borderRadius,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-6 w-6 rounded-md flex items-center justify-center text-white text-[10px] font-black"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                      }}
                    >
                      DL
                    </div>
                    <span className="text-xs font-extrabold tracking-tight">
                      DAILY LATEST
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="font-semibold" style={{ color: theme.primaryColor }}>
                      राजनीति
                    </span>
                    <span>व्यापार</span>
                    <span>तकनीक</span>
                  </div>
                </div>

                {/* Mock Ticker */}
                <div
                  className="mb-4 flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] border"
                  style={{
                    borderColor: `${theme.primaryColor}30`,
                    background: `${theme.primaryColor}10`,
                  }}
                >
                  <span
                    className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Flame className="h-2.5 w-2.5" />
                    BREAKING
                  </span>
                  <span className="truncate text-[10px] font-medium opacity-90">
                    संसद का शीतकालीन सत्र: देश में AI और अर्थव्यवस्था पर बड़ा फैसला
                  </span>
                </div>

                {/* Mock Hero Glass Card */}
                <div
                  className="group relative overflow-hidden border transition-all"
                  style={{
                    backgroundColor:
                      previewMode === "dark"
                        ? `rgba(15, 23, 42, ${theme.glassOpacity})`
                        : `rgba(255, 255, 255, ${theme.glassOpacity})`,
                    backdropFilter: `blur(${theme.glassBlur})`,
                    borderColor:
                      theme.cardStyle === "glow"
                        ? `${theme.primaryColor}60`
                        : previewMode === "dark"
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(0, 0, 0, 0.08)",
                    boxShadow:
                      theme.cardStyle === "glow"
                        ? `0 0 25px -5px ${theme.primaryColor}40`
                        : undefined,
                    borderRadius: theme.borderRadius,
                  }}
                >
                  <div className="relative aspect-[16/9] w-full bg-slate-800 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80"
                      alt="News Preview"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <span
                      className="absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider shadow"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                      }}
                    >
                      Top Story
                    </span>
                  </div>

                  <div className="p-3.5">
                    <div className="flex items-center gap-2 mb-1.5 text-[10px] opacity-75">
                      <span
                        className="font-bold uppercase"
                        style={{ color: theme.accentColor }}
                      >
                        अर्थव्यवस्था
                      </span>
                      <span>•</span>
                      <span>3 मिनट पहले</span>
                    </div>

                    <h4
                      className="font-bold text-xs leading-snug line-clamp-2 mb-2"
                      style={{
                        fontFamily:
                          theme.headingFont === "serif"
                            ? "var(--font-noto-serif-devanagari), Georgia, serif"
                            : "var(--font-noto-sans-devanagari), sans-serif",
                      }}
                    >
                      सेंसेक्स 80,000 के पार, निफ्टी ने भी बनाया नया ऑल-टाइम रिकॉर्ड
                    </h4>

                    <p className="text-[11px] opacity-75 line-clamp-2 mb-3">
                      भारतीय शेयर बाजार में रिकॉर्ड तोड़ तेजी जारी है। विदेशी निवेशकों
                      की जोरदार लिवाली से बाजार में उत्साह।
                    </p>

                    <button
                      className="w-full rounded-lg py-1.5 text-[10px] font-bold text-white shadow transition-transform active:scale-95"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                      }}
                    >
                      पूरा समाचार पढ़ें →
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-center">
                <span className="text-[11px] text-slate-500">
                  Changes update immediately in this preview and on the public site when saved.
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
