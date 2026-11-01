"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import {
  LayoutTemplate,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Sliders,
  Layers,
  Sparkles,
  Grid,
  List,
  Columns,
  PlaySquare,
  Flame,
  Mail,
  Zap,
  Vote,
} from "lucide-react";
import type { Role } from "@/lib/auth/rbac";

interface SectionConfig {
  id: string;
  type:
    | "hero-spotlight"
    | "breaking-ticker"
    | "trending-rank"
    | "latest-feed"
    | "category-magazine"
    | "video-hub"
    | "special-editorial"
    | "newsletter"
    | "ad-banner"
    | "poll-widget";
  title: string;
  subtitle?: string;
  categorySlug?: string;
  layout:
    | "magazine"
    | "grid"
    | "masonry"
    | "list"
    | "carousel"
    | "split"
    | "compact";
  articleCount: number;
  background: "transparent" | "glass" | "subtle-gradient" | "solid-dark";
  accentColor?: string;
  isEnabled: boolean;
  order: number;
}

const SECTION_TEMPLATES = [
  {
    type: "hero-spotlight",
    label: "Hero Spotlight",
    icon: Sparkles,
    defaultTitle: "प्रमुख समाचार (Spotlight)",
    defaultLayout: "split" as const,
    defaultCount: 5,
    description: "High-impact editorial hero with 1 large spotlight story & 2-4 side stories",
  },
  {
    type: "breaking-ticker",
    label: "Breaking News Ticker",
    icon: Zap,
    defaultTitle: "ब्रेकिंग न्यूज़",
    defaultLayout: "compact" as const,
    defaultCount: 8,
    description: "Animated continuous headline marquee with live pulse indicator",
  },
  {
    type: "trending-rank",
    label: "Trending Stories (Ranked 1-5)",
    icon: Flame,
    defaultTitle: "ट्रेंडिंग न्यूज़",
    defaultLayout: "compact" as const,
    defaultCount: 5,
    description: "Numbered ranking cards for most read and viral reports",
  },
  {
    type: "category-magazine",
    label: "Category Magazine Section",
    icon: Columns,
    defaultTitle: "श्रेणी समाचार",
    defaultLayout: "magazine" as const,
    defaultCount: 4,
    description: "Configurable section tied to a specific category with lead story & grid cards",
  },
  {
    type: "video-hub",
    label: "Video News Hub",
    icon: PlaySquare,
    defaultTitle: "वीडियो बुलेटिन व रिपोर्ट",
    defaultLayout: "carousel" as const,
    defaultCount: 4,
    description: "Video player cards with play buttons, timestamps, and popup playback",
  },
  {
    type: "special-editorial",
    label: "Special Investigations & Explainers",
    icon: Layers,
    defaultTitle: "विशेष विश्लेषण व फैक्ट चेक",
    defaultLayout: "split" as const,
    defaultCount: 3,
    description: "Opinion, Ground Reports, Deep Dives and Fact Check cards",
  },
  {
    type: "latest-feed",
    label: "Latest News Stream",
    icon: Grid,
    defaultTitle: "ताज़ा अपडेट्स (Latest Feed)",
    defaultLayout: "masonry" as const,
    defaultCount: 8,
    description: "Continuous chronological stream with category filter tabs",
  },
  {
    type: "newsletter",
    label: "Newsletter Subscription Box",
    icon: Mail,
    defaultTitle: "डेली ब्रीफिंग न्यूज़लेटर",
    defaultLayout: "compact" as const,
    defaultCount: 0,
    description: "Glassmorphism subscriber box with email capture input",
  },
  {
    type: "poll-widget",
    label: "Public Opinion Poll (जनमत सर्वेक्षण)",
    icon: Vote,
    defaultTitle: "जनता की राय (Public Opinion Poll)",
    defaultLayout: "compact" as const,
    defaultCount: 0,
    description: "Interactive reader voting poll managed from the Opinion Polls admin panel",
  },
];

export default function HomepageBuilderPage() {
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
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
    fetchData();
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

  const fetchData = async () => {
    try {
      const [hpRes, catRes] = await Promise.all([
        fetch("/api/admin/homepage"),
        fetch("/api/admin/categories"),
      ]);

      if (hpRes.ok) {
        const hpData = await hpRes.json();
        if (hpData?.sections && Array.isArray(hpData.sections)) {
          setSections(hpData.sections);
        }
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Recalculate order numbers
    copy.forEach((sec, idx) => {
      sec.order = idx + 1;
    });

    setSections(copy);
  };

  const toggleSection = (index: number) => {
    const copy = [...sections];
    copy[index].isEnabled = !copy[index].isEnabled;
    setSections(copy);
  };

  const removeSection = (index: number) => {
    if (!confirm("Are you sure you want to remove this section?")) return;
    const copy = sections.filter((_, idx) => idx !== index);
    copy.forEach((sec, idx) => {
      sec.order = idx + 1;
    });
    setSections(copy);
    showToast("Section removed");
  };

  const addSection = (template: (typeof SECTION_TEMPLATES)[0]) => {
    const newSec: SectionConfig = {
      id: `sec-${Date.now()}`,
      type: template.type as SectionConfig["type"],
      title: template.defaultTitle,
      subtitle: "",
      categorySlug: categories[0]?.slug || "national",
      layout: template.defaultLayout,
      articleCount: template.defaultCount,
      background: "transparent",
      isEnabled: true,
      order: sections.length + 1,
    };
    setSections([...sections, newSec]);
    showToast(`Added new ${template.label} section`);
  };

  const updateSectionField = <K extends keyof SectionConfig>(
    index: number,
    field: K,
    val: SectionConfig[K]
  ) => {
    const copy = [...sections];
    copy[index][field] = val;
    setSections(copy);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sections, isPublished: true }),
      });

      if (res.ok) {
        showToast("Homepage layout published successfully!");
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to save layout");
      }
    } catch {
      showToast("Network error saving layout");
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
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <LayoutTemplate className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Drag & Drop Homepage Builder
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Add, remove, reorder, and configure dynamic homepage news sections in real time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Publishing..." : "Publish Homepage Layout"}</span>
            </button>
          </div>
        </div>

        {/* Builder Content Area */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
          {/* Active Sections Sequence (Left 8 cols) */}
          <div className="space-y-4 xl:col-span-8">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Active Sections Sequence ({sections.length})
              </h2>
              <span className="text-xs text-slate-400">
                Use arrows to reorder • Toggle eye to show/hide
              </span>
            </div>

            {sections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
                <p className="text-slate-400">No sections added yet.</p>
                <p className="mt-1 text-xs text-slate-500">
                  Select a section template from the right panel to get started.
                </p>
              </div>
            ) : (
              sections.map((sec, idx) => {
                const template = SECTION_TEMPLATES.find((t) => t.type === sec.type);
                const Icon = template?.icon || Layers;

                return (
                  <div
                    key={sec.id}
                    className={`rounded-2xl border p-5 backdrop-blur-xl transition-all ${
                      sec.isEnabled
                        ? "border-white/10 bg-white/5 shadow-xl shadow-black/20"
                        : "border-white/5 bg-white/[0.02] opacity-60"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      {/* Section Identification */}
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600/30 to-indigo-600/30 text-blue-400 border border-blue-500/20">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-500">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                              {template?.label || sec.type}
                            </span>
                            {!sec.isEnabled && (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                                Disabled
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) =>
                              updateSectionField(idx, "title", e.target.value)
                            }
                            placeholder="Section Title"
                            className="mt-1 block w-full rounded-lg border border-transparent bg-transparent px-1.5 py-0.5 text-base font-bold text-white hover:border-white/10 focus:border-blue-500 focus:bg-slate-900 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Control Actions: Up, Down, Visibility, Remove */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => moveSection(idx, "up")}
                          disabled={idx === 0}
                          title="Move Up"
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 disabled:opacity-25"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveSection(idx, "down")}
                          disabled={idx === sections.length - 1}
                          title="Move Down"
                          className="rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/10 disabled:opacity-25"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => toggleSection(idx)}
                          title={sec.isEnabled ? "Disable Section" : "Enable Section"}
                          className={`rounded-lg border p-2 transition-colors ${
                            sec.isEnabled
                              ? "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                              : "border-white/10 bg-white/5 text-slate-500 hover:bg-white/10"
                          }`}
                        >
                          {sec.isEnabled ? (
                            <Eye className="h-3.5 w-3.5" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => removeSection(idx)}
                          title="Remove Section"
                          className="rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Section Configuration Fields */}
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4 pt-4 border-t border-white/10 text-xs">
                      {/* Subtitle */}
                      <div className="sm:col-span-2">
                        <label className="mb-1 block font-semibold text-slate-400">
                          Subtitle / Brief Description
                        </label>
                        <input
                          type="text"
                          value={sec.subtitle || ""}
                          onChange={(e) =>
                            updateSectionField(idx, "subtitle", e.target.value)
                          }
                          placeholder="e.g. आज की सबसे बड़ी सुर्खियां"
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Layout */}
                      <div>
                        <label className="mb-1 block font-semibold text-slate-400">
                          Layout Style
                        </label>
                        <select
                          value={sec.layout}
                          onChange={(e) =>
                            updateSectionField(
                              idx,
                              "layout",
                              e.target.value as SectionConfig["layout"]
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1.5 text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="magazine">Magazine (Lead + Grid)</option>
                          <option value="grid">Grid (4 Columns)</option>
                          <option value="masonry">Masonry Feed</option>
                          <option value="split">Split Layout</option>
                          <option value="carousel">Video Carousel</option>
                          <option value="compact">Compact List</option>
                        </select>
                      </div>

                      {/* Article Count */}
                      <div>
                        <label className="mb-1 block font-semibold text-slate-400">
                          Article Count
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={sec.articleCount}
                          onChange={(e) =>
                            updateSectionField(
                              idx,
                              "articleCount",
                              parseInt(e.target.value) || 4
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-white focus:border-blue-500 focus:outline-none"
                        />
                      </div>

                      {/* Category Link (if category-magazine or applicable) */}
                      {sec.type === "category-magazine" && (
                        <div className="sm:col-span-2">
                          <label className="mb-1 block font-semibold text-slate-400">
                            Category Source
                          </label>
                          <select
                            value={sec.categorySlug}
                            onChange={(e) =>
                              updateSectionField(idx, "categorySlug", e.target.value)
                            }
                            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-white focus:border-blue-500 focus:outline-none"
                          >
                            {categories.map((c) => (
                              <option key={c.slug} value={c.slug}>
                                {c.name} ({c.slug})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Background Styling */}
                      <div className="sm:col-span-2">
                        <label className="mb-1 block font-semibold text-slate-400">
                          Background Style
                        </label>
                        <select
                          value={sec.background}
                          onChange={(e) =>
                            updateSectionField(
                              idx,
                              "background",
                              e.target.value as SectionConfig["background"]
                            )
                          }
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-white focus:border-blue-500 focus:outline-none"
                        >
                          <option value="transparent">Transparent / Seamless</option>
                          <option value="glass">Frosted Glass Card</option>
                          <option value="subtle-gradient">Subtle Radiant Gradient</option>
                          <option value="solid-dark">Solid Dark Contrast</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Available Templates (Right 4 cols) */}
          <div className="xl:col-span-4">
            <div className="sticky top-6 rounded-2xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-2xl shadow-2xl">
              <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white">
                  <Plus className="h-4 w-4 text-blue-400" />
                  <span>Add New Section</span>
                </h3>
              </div>

              <div className="space-y-3">
                {SECTION_TEMPLATES.map((tmpl) => {
                  const Icon = tmpl.icon;
                  return (
                    <button
                      key={tmpl.type}
                      onClick={() => addSection(tmpl)}
                      className="group flex w-full items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3.5 text-left transition-all hover:border-blue-500/40 hover:bg-blue-950/30 hover:scale-[1.01]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white group-hover:text-blue-300">
                            {tmpl.label}
                          </span>
                          <Plus className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-400" />
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                          {tmpl.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-950/30 p-3.5 text-xs text-slate-300">
                <p className="font-semibold text-blue-300 mb-1">Live CMS Architecture</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  When you click <strong>Publish Homepage Layout</strong>, your changes
                  persist in the database and immediately re-render the frontend homepage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
