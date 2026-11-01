"use client";

import { useState } from "react";
import { X, Eye, EyeOff, Lock, Mail, User, MapPin, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AuthModal() {
  const { isAuthModalOpen, authModalTab, closeAuthModal, login } = useAuth();
  const [tab, setTab] = useState<"login" | "signup" | "forgot">(authModalTab);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("hi");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Keep internal tab in sync when opened from outside
  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "लॉगिन विफल रहा (Login failed)");
      } else {
        login(data.user);
      }
    } catch {
      setError("नेटवर्क त्रुटि। कृपया पुनः प्रयास करें। (Network error)");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, city, language }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "पंजीकरण विफल रहा (Registration failed)");
      } else {
        login(data.user);
      }
    } catch {
      setError("नेटवर्क त्रुटि। कृपया पुनः प्रयास करें। (Network error)");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "अनुरोध विफल रहा");
      } else {
        setSuccess(data.message);
      }
    } catch {
      setError("नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/95 dark:bg-neutral-950/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all"
      >
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-red-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-blue-600/20 blur-3xl" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          type="button"
          aria-label="पॉपअप बंद करें (Close modal)"
          className="absolute top-4 right-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#9a1418] via-[#c61d23] to-[#ef4444] text-white shadow-lg shadow-red-900/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2
            id="auth-modal-title"
            className="text-xl font-black text-gray-900 dark:text-white tracking-tight"
          >
            {tab === "login" && "भारत पल्स में आपका स्वागत है"}
            {tab === "signup" && "निःशुल्क खाता बनाएं"}
            {tab === "forgot" && "पासवर्ड रीसेट करें"}
          </h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-neutral-400">
            {tab === "login" && "ताज़ा और व्यक्तिगत समाचारों के लिए लॉगिन करें"}
            {tab === "signup" && "पसंदीदा शहर व श्रेणी की ताज़ा खबरें सीधे प्राप्त करें"}
            {tab === "forgot" && "अपना पंजीकृत ईमेल दर्ज करें"}
          </p>
        </div>

        {/* Tab Switcher */}
        {tab !== "forgot" && (
          <div className="mb-6 flex rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-100/80 dark:bg-neutral-900 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 transition-all cursor-pointer ${
                tab === "login"
                  ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              लॉगिन (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("signup");
                setError(null);
              }}
              className={`flex-1 rounded-lg py-2 transition-all cursor-pointer ${
                tab === "signup"
                  ? "bg-white dark:bg-neutral-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
            >
              रजिस्टर (Sign Up)
            </button>
          </div>
        )}

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ── Form: Login ── */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                ईमेल पता (Email)
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] focus:outline-none focus:ring-1 focus:ring-[#c61d23]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                  पासवर्ड (Password)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setTab("forgot");
                    setError(null);
                    setSuccess(null);
                  }}
                  className="text-[11px] font-semibold text-[#c61d23] hover:underline cursor-pointer"
                >
                  पासवर्ड भूल गए?
                </button>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-10 pr-10 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] focus:outline-none focus:ring-1 focus:ring-[#c61d23]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "पासवर्ड छिपाएं" : "पासवर्ड दिखाएं"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#c61d23] py-3 text-xs font-bold text-white shadow-lg shadow-red-900/20 hover:bg-[#a8161b] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "प्रमाणित हो रहा है..." : "लॉगिन करें (Sign In) →"}
            </button>
          </form>
        )}

        {/* ── Form: Register ── */}
        {tab === "signup" && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                पूरा नाम (Full Name)
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="राहुल शर्मा"
                  className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-10 pr-4 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] focus:outline-none focus:ring-1 focus:ring-[#c61d23]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                ईमेल पता (Email)
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-10 pr-4 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] focus:outline-none focus:ring-1 focus:ring-[#c61d23]"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                पासवर्ड (Password - Min 6 Chars)
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-10 pr-10 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] focus:outline-none focus:ring-1 focus:ring-[#c61d23]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "पासवर्ड छिपाएं" : "पासवर्ड दिखाएं"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                  पसंदीदा शहर (City)
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="जयपुर / दिल्ली"
                    className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-8 pr-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                  भाषा (Language)
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#c61d23] focus:outline-none"
                >
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="en">English</option>
                  <option value="bn">বাংলা (Bengali)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#c61d23] py-2.5 text-xs font-bold text-white shadow-lg shadow-red-900/20 hover:bg-[#a8161b] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "खाता बन रहा है..." : "निःशुल्क रजिस्टर करें (Create Account) →"}
            </button>
          </form>
        )}

        {/* ── Form: Forgot Password ── */}
        {tab === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-gray-700 dark:text-neutral-300">
                पंजीकृत ईमेल दर्ज करें
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#c61d23] py-3 text-xs font-bold text-white shadow hover:bg-[#a8161b] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "भेजा जा रहा है..." : "पासवर्ड रीसेट लिंक भेजें →"}
            </button>

            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
                setSuccess(null);
              }}
              className="w-full text-center text-xs font-semibold text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
            >
              ← वापस लॉगिन पर जाएं
            </button>
          </form>
        )}

        {/* Guest Assurance Notice */}
        <div className="mt-6 border-t border-gray-200 dark:border-neutral-800 pt-4 text-center">
          <p className="text-[11px] text-gray-500 dark:text-neutral-400 leading-relaxed">
            बिना लॉगिन किए भी सभी समाचार पढ़े जा सकते हैं। खाता बनाने से बुकमार्क और शहर अनुसार खबरें सुरक्षित रहती हैं।
          </p>
        </div>
      </div>
    </div>
  );
}

