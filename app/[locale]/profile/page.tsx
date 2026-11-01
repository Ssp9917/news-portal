"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Bookmark,
  History,
  Settings,
  Bell,
  MapPin,
  ShieldAlert,
  LogOut,
  Save,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import TopBar from "@/components/TopBar";
import PremiumHeader from "@/components/PremiumHeader";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const { user, loading, logout, updateUser, openAuthModal, toggleBookmark } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"profile" | "bookmarks" | "history" | "preferences" | "security">("profile");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [language, setLanguage] = useState("hi");
  const [categories, setCategories] = useState<string[]>([]);
  const [dailyDigest, setDailyDigest] = useState("morning");
  const [notifications, setNotifications] = useState({
    breaking: true,
    local: true,
    digest: true,
    marketing: false,
  });

  const [bookmarkedArticles, setBookmarkedArticles] = useState<any[]>([]);
  const [readingHistory, setReadingHistory] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync profile data when user is loaded
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setCity(user.preferences?.city || "");
      setState(user.preferences?.state || "");
      setLanguage(user.preferences?.language || "hi");
      setCategories(user.preferences?.categories || ["national", "politics", "sports"]);
      setDailyDigest(user.preferences?.dailyDigest || "morning");
      if (user.preferences?.notificationTypes) {
        setNotifications(user.preferences.notificationTypes as any);
      }
    }
  }, [user]);

  // Fetch bookmarks & reading history
  useEffect(() => {
    if (user) {
      fetch("/api/user/bookmarks")
        .then((r) => r.json())
        .then((d) => setBookmarkedArticles(d.articles || []))
        .catch(() => {});

      fetch("/api/user/history")
        .then((r) => r.json())
        .then((d) => setReadingHistory(d.history || []))
        .catch(() => {});
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          preferences: {
            language,
            city,
            state,
            categories,
            notificationTypes: notifications,
            dailyDigest,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm("क्या आप वाकई पढ़ने का संपूर्ण इतिहास साफ़ करना चाहते हैं?")) {
      await fetch("/api/user/history", { method: "DELETE" });
      setReadingHistory([]);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("चेतावनी: खाता हटाने पर सभी बुकमार्क और व्यक्तिगत डेटा हमेशा के लिए मिट जाएगा। क्या आप जारी रखना चाहते हैं?")) {
      const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
      if (res.ok) {
        logout();
      }
    }
  };

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const allCategoryPills = [
    { id: "national", label: "राष्ट्रीय (National)" },
    { id: "politics", label: "राजनीति (Politics)" },
    { id: "business", label: "व्यापार (Business)" },
    { id: "sports", label: "खेल (Sports)" },
    { id: "technology", label: "तकनीक (Tech)" },
    { id: "world", label: "दुनिया (World)" },
    { id: "health", label: "स्वास्थ्य (Health)" },
    { id: "education", label: "शिक्षा (Education)" },
    { id: "automobile", label: "ऑटोमोबाइल (Automobile)" },
    { id: "entertainment", label: "मनोरंजन (Entertainment)" },
    { id: "crime", label: "क्राइम (Crime)" },
    { id: "schemes", label: "सरकारी योजनाएं (Schemes)" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto mb-2" />
          <p className="text-xs text-gray-500">लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 flex flex-col justify-between">
        <TopBar />
        <PremiumHeader />
        <div className="container mx-auto max-w-md px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-[#c61d23] dark:bg-red-950/40 dark:text-red-400">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            प्रोफ़ाइल देखने के लिए लॉगिन करें
          </h2>
          <p className="mt-2 text-xs text-gray-600 dark:text-neutral-400 leading-relaxed">
            सहेजे गए लेख, पढ़ने का इतिहास और पसंदीदा श्रेणियों को प्रबंधित करने के लिए अपने खाते में प्रवेश करें।
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#c61d23] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-900/20 hover:bg-[#a8161b] transition-all cursor-pointer"
          >
            <span>लॉगिन करें (Sign In)</span>
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white transition-colors">
      <TopBar />
      <PremiumHeader />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* Profile Header Banner */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9a1418] to-[#c61d23] text-2xl font-black text-white shadow-md">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-black text-gray-900 dark:text-white">
                  {user.name || "पाठक (Reader)"}
                </h1>
                <span className="rounded-full bg-red-100 dark:bg-red-950/60 px-2.5 py-0.5 text-[10px] font-bold text-[#c61d23] dark:text-red-400 border border-red-500/20">
                  {user.role === "user" ? "सक्रिय पाठक" : user.role.toUpperCase()}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400">
                {user.email}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-600 dark:text-neutral-300">
                <span className="flex items-center gap-1">
                  <Bookmark className="h-3.5 w-3.5 text-red-500" />
                  <strong>{bookmarkedArticles.length}</strong> सहेजे गए लेख
                </span>
                <span className="flex items-center gap-1">
                  <History className="h-3.5 w-3.5 text-blue-500" />
                  <strong>{readingHistory.length}</strong> हालिया पढ़े गए
                </span>
                {city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                    {city} {state ? `(${state})` : ""}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-2 text-xs font-bold text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>लॉगआउट</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 flex overflow-x-auto border-b border-gray-200 dark:border-neutral-800 pb-2 text-xs font-bold gap-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "profile"
                ? "bg-[#c61d23] text-white shadow"
                : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
            }`}
          >
            <User className="h-4 w-4" />
            <span>प्रोफ़ाइल विवरण (Profile Info)</span>
          </button>

          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "bookmarks"
                ? "bg-[#c61d23] text-white shadow"
                : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>सहेजे गए लेख ({bookmarkedArticles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "history"
                ? "bg-[#c61d23] text-white shadow"
                : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
            }`}
          >
            <History className="h-4 w-4" />
            <span>पठन इतिहास ({readingHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "preferences"
                ? "bg-[#c61d23] text-white shadow"
                : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>रुचियां एवं नोटिफिकेशन</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "security"
                ? "bg-[#c61d23] text-white shadow"
                : "text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>खाता सेटिंग्स</span>
          </button>
        </div>

        {/* Tab 1: Profile Info */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="max-w-2xl rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-neutral-800 pb-2">
              व्यक्तिगत जानकारी
            </h3>

            {savedSuccess && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>प्रोफ़ाइल सफलतापूर्वक सुरक्षित कर ली गई है!</span>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                पूरा नाम
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#c61d23] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                ईमेल (बदला नहीं जा सकता)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-800/50 px-3.5 py-2 text-xs text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                फ़ोन नंबर (वैकल्पिक)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#c61d23] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                  पसंदीदा शहर (City)
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="जयपुर"
                  className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#c61d23] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                  राज्य (State)
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="राजस्थान"
                  className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#c61d23] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-[#c61d23] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#a8161b] transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "सुरक्षित हो रहा है..." : "परिवर्तन सुरक्षित करें"}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Bookmarks */}
        {activeTab === "bookmarks" && (
          <div>
            {bookmarkedArticles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-neutral-800 p-12 text-center">
                <Bookmark className="mx-auto h-12 w-12 text-gray-300 dark:text-neutral-700 mb-3" />
                <h4 className="text-sm font-bold text-gray-700 dark:text-neutral-300">
                  कोई सहेजा गया लेख नहीं मिला
                </h4>
                <p className="mt-1 text-xs text-gray-500">
                  किसी भी समाचार पर बुकमार्क आइकन दबाकर उसे बाद में पढ़ने के लिए सहेजें।
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-block rounded-xl bg-[#c61d23] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#a8161b]"
                >
                  ताज़ा समाचार पढ़ें →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarkedArticles.map((art) => (
                  <div
                    key={art._id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-sm hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-neutral-800 mb-2.5">
                        <img
                          src={art.image || "https://placehold.co/400x250"}
                          alt={art.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="absolute top-2 left-2 rounded bg-[#c61d23] px-2 py-0.5 text-[9px] font-bold text-white shadow">
                          {art.category}
                        </span>
                      </div>
                      <Link
                        href={`/news/${art.slug || art._id}`}
                        className="text-xs font-bold leading-snug text-gray-900 dark:text-white line-clamp-2 hover:text-[#c61d23] transition-colors"
                      >
                        {art.title}
                      </Link>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-2 text-[10px] text-gray-500">
                      <span>{art.date}</span>
                      <button
                        onClick={() => {
                          toggleBookmark(art.slug || art._id);
                          setBookmarkedArticles((prev) =>
                            prev.filter((p) => (p.slug || p._id) !== (art.slug || art._id))
                          );
                        }}
                        className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                      >
                        हटाएं (Remove)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Reading History */}
        {activeTab === "history" && (
          <div className="max-w-3xl rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  हाल ही में पढ़े गए समाचार
                </h3>
                <p className="text-[11px] text-gray-500">
                  आपके द्वारा पढ़े गए अंतिम 50 लेखों की सूची।
                </p>
              </div>
              {readingHistory.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>इतिहास मिटाएं</span>
                </button>
              )}
            </div>

            {readingHistory.length === 0 ? (
              <p className="py-8 text-center text-xs text-gray-500">
                अभी तक कोई पठन इतिहास दर्ज नहीं है।
              </p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                {readingHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2.5">
                    <div className="flex-1 min-w-0 pr-4">
                      <Link
                        href={`/news/${item.slug}`}
                        className="text-xs font-bold text-gray-800 dark:text-neutral-200 hover:text-[#c61d23] line-clamp-1 transition-colors"
                      >
                        {item.title}
                      </Link>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="text-[#c61d23] font-semibold">{item.category}</span>
                        <span>•</span>
                        <span>{new Date(item.viewedAt).toLocaleDateString()} {new Date(item.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <Link
                      href={`/news/${item.slug}`}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                      aria-label="लेख खोलें"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Preferences & Notifications */}
        {activeTab === "preferences" && (
          <form onSubmit={handleSaveProfile} className="max-w-2xl rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                पसंदीदा समाचार श्रेणियां (Followed Topics)
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                आपके होमपेज &quot;For You&quot; फीड में इन श्रेणियों की खबरें पहले दिखाई देंगी।
              </p>
              <div className="flex flex-wrap gap-2">
                {allCategoryPills.map((cat) => {
                  const isSelected = categories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#c61d23] text-white shadow-sm"
                          : "border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:border-gray-400"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-neutral-800 pt-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                दैनिक समाचार डाइजेस्ट (Daily Digest)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {["morning", "afternoon", "evening", "none"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDailyDigest(opt)}
                    className={`rounded-xl border p-2.5 text-center font-bold capitalize transition-all cursor-pointer ${
                      dailyDigest === opt
                        ? "border-[#c61d23] bg-red-50 text-[#c61d23] dark:bg-red-950/40 dark:text-red-400"
                        : "border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {opt === "morning" && "सुबह (Morning)"}
                    {opt === "afternoon" && "दोपहर (Afternoon)"}
                    {opt === "evening" && "शाम (Evening)"}
                    {opt === "none" && "बंद रखें (None)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-neutral-800 pt-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                पुश नोटिफिकेशन प्राथमिकताएं
              </h3>
              <div className="space-y-2 text-xs">
                {[
                  { key: "breaking", label: "ब्रेकिंग न्यूज़ अलर्ट (Breaking News)" },
                  { key: "local", label: "शहर व स्थानीय समाचार अलर्ट (Local News)" },
                  { key: "digest", label: "दैनिक समाचार बुलेटिन (Daily Digest)" },
                  { key: "marketing", label: "विशेष रिपोर्ट व प्रचार अभियान (Campaigns)" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={(notifications as any)[item.key]}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          [item.key]: e.target.value === "on" ? e.target.checked : false,
                        })
                      }
                      className="h-4 w-4 rounded text-[#c61d23] focus:ring-[#c61d23]"
                    />
                    <span className="font-semibold text-gray-700 dark:text-neutral-300">
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#c61d23] px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#a8161b] transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "सुरक्षित हो रहा है..." : "सेटिंग्स सुरक्षित करें"}</span>
            </button>
          </form>
        )}

        {/* Tab 5: Security & Delete Account */}
        {activeTab === "security" && (
          <div className="max-w-2xl rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                पासवर्ड बदलें
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                यदि आप अपना पासवर्ड भूल गए हैं या बदलना चाहते हैं, तो नीचे दिए गए लिंक पर क्लिक करें।
              </p>
              <button
                type="button"
                onClick={() => openAuthModal("forgot")}
                className="rounded-xl border border-gray-300 dark:border-neutral-700 px-4 py-2 text-xs font-bold text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
              >
                पासवर्ड रीसेट लिंक प्राप्त करें →
              </button>
            </div>

            <div className="border-t border-red-200 dark:border-red-950/60 pt-6">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-red-600 dark:text-red-400">
                    खाता स्थायी रूप से हटाएं (Delete Account)
                  </h4>
                  <p className="mt-1 text-xs text-gray-600 dark:text-neutral-400 leading-relaxed">
                    खाता हटाने पर आपके सभी बुकमार्क, व्यक्तिगत प्राथमिकताएं और पठन इतिहास हमेशा के लिए हटा दिए जाएंगे। यह प्रक्रिया अपरिवर्तनीय है।
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>मेरा खाता हटाएं</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

