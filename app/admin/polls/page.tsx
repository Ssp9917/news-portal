"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import {
  Vote,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Calendar,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Users,
  X,
  ExternalLink,
} from "lucide-react";
import type { Role } from "@/lib/auth/rbac";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  _id: string;
  question: string;
  category: string;
  options: PollOption[];
  totalVotes: number;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export default function AdminPollsPage() {
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [stats, setStats] = useState({ totalPolls: 0, activePolls: 0, totalVotes: 0 });
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name?: string; role: Role } | null>(null);

  // New Poll Form State
  const [newQuestion, setNewQuestion] = useState("");
  const [newCategory, setNewCategory] = useState("राष्ट्रीय");
  const [newOptions, setNewOptions] = useState<string[]>([
    "हाँ, पूरी तरह सहमत (Strongly Agree)",
    "नहीं, असहमत (Disagree)",
    "कह नहीं सकते (Can't Say)",
  ]);
  const [newIsActive, setNewIsActive] = useState(true);
  const [newExpiresAt, setNewExpiresAt] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/admin");
        return;
      }

      const res = await fetch("/api/admin/polls", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setPolls(data.polls || []);
        if (data.stats) setStats(data.stats);
      } else {
        showToast("पोल डेटा लोड नहीं हो पाया");
      }
    } catch {
      showToast("नेटवर्क त्रुटि: पोल डेटा लोड नहीं हुआ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    // Fetch user info for RBAC
    fetch("/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    fetchPolls();
  }, [router]);

  const handleAddOptionField = () => {
    if (newOptions.length >= 6) {
      alert("अधिकतम 6 विकल्प जोड़े जा सकते हैं");
      return;
    }
    setNewOptions([...newOptions, ""]);
  };

  const handleRemoveOptionField = (idx: number) => {
    if (newOptions.length <= 2) {
      alert("कम से कम 2 विकल्प होने आवश्यक हैं");
      return;
    }
    setNewOptions(newOptions.filter((_, i) => i !== idx));
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...newOptions];
    updated[idx] = val;
    setNewOptions(updated);
  };

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) {
      alert("कृपया पोल का प्रश्न लिखें");
      return;
    }

    const validOptions = newOptions.map((o) => o.trim()).filter(Boolean);
    if (validOptions.length < 2) {
      alert("कृपया कम से कम 2 मान्य विकल्प भरें");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: newQuestion,
          category: newCategory,
          options: validOptions,
          isActive: newIsActive,
          expiresAt: newExpiresAt || null,
        }),
      });

      if (res.ok) {
        showToast("नया पोल सफलतापूर्वक बनाया गया!");
        setModalOpen(false);
        setNewQuestion("");
        setNewOptions([
          "हाँ, पूरी तरह सहमत (Strongly Agree)",
          "नहीं, असहमत (Disagree)",
          "कह नहीं सकते (Can't Say)",
        ]);
        setNewExpiresAt("");
        fetchPolls();
      } else {
        const err = await res.json();
        alert(err.error || "पोल बनाने में विफलता");
      }
    } catch {
      alert("नेटवर्क त्रुटि: पोल नहीं बन सका");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (pollId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/polls/${pollId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (res.ok) {
        showToast(!currentStatus ? "पोल लाइव कर दिया गया है!" : "पोल को निष्क्रिय कर दिया गया");
        fetchPolls();
      } else {
        showToast("स्टेटस अपडेट नहीं हो पाया");
      }
    } catch {
      showToast("नेटवर्क त्रुटि");
    }
  };

  const handleResetVotes = async (pollId: string) => {
    if (!confirm("क्या आप सचमुच इस पोल के सभी वोट्स को शून्य (0) पर रीसेट करना चाहते हैं?")) {
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/polls/${pollId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resetVotes: true }),
      });

      if (res.ok) {
        showToast("वोट्स सफलतापूर्वक रीसेट हो गए");
        fetchPolls();
      }
    } catch {
      showToast("वोट रीसेट नहीं हो सके");
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm("क्या आप इस पोल को पूरी तरह हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।")) {
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/polls/${pollId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("पोल सफलतापूर्वक हटा दिया गया");
        fetchPolls();
      }
    } catch {
      showToast("डिलीट करने में त्रुटि");
    }
  };

  const activePoll = polls.find((p) => p.isActive);

  // Palette for vote percentage progress bars
  const barColors = [
    "bg-emerald-500 text-emerald-400",
    "bg-blue-500 text-blue-400",
    "bg-amber-500 text-amber-400",
    "bg-rose-500 text-rose-400",
    "bg-purple-500 text-purple-400",
    "bg-cyan-500 text-cyan-400",
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      <AdminNav currentUser={currentUser} />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
              <Vote className="h-4 w-4" />
              <span>Interactive Audience Engagement</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              जनमत सर्वेक्षण / Opinion Polls
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              वेबसाइट होमपेज और आर्टिकल पेज पर पाठकों के लाइव जनमत सर्वेक्षण प्रबंधित करें
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPolls}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
              title="रीफ्रेश करें"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-900/40 hover:from-red-500 hover:to-rose-500 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>नया पोल बनाएं (New Poll)</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/90 px-4 py-3 text-xs font-semibold text-emerald-200 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2">
              <span>लाइव सक्रिय पोल</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>
            <div className="text-2xl font-black text-white">
              {stats.activePolls > 0 ? "1 सक्रिय (Live)" : "कोई लाइव नहीं"}
            </div>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {activePoll ? activePoll.question : "पाठकों के लिए नया पोल लाइव करें"}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">
              <span>कुल बनाए गए पोल</span>
              <Vote className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{stats.totalPolls}</div>
            <p className="text-xs text-slate-400 mt-1">सक्रिय व पुरालेख (Archived) पोल</p>
          </div>

          <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-purple-400 font-bold uppercase tracking-wider mb-2">
              <span>कुल पाठक वोट्स</span>
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats.totalVotes.toLocaleString("hi-IN")}
            </div>
            <p className="text-xs text-slate-400 mt-1">सभी पोल पर कुल जनमत प्रतिक्रियाएं</p>
          </div>
        </div>

        {/* Polls List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>सभी जनमत सर्वेक्षण ({polls.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw className="h-8 w-8 animate-spin text-red-500 mb-3" />
              <p className="text-sm">सर्वेक्षण डेटा लोड हो रहा है...</p>
            </div>
          ) : polls.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 p-8">
              <Vote className="h-12 w-12 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">कोई पोल नहीं मिला</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                होमपेज और न्यूज़ आर्टिकल्स पर पाठकों की राय जानने के लिए पहला सर्वेक्षण बनाएं।
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500"
              >
                <Plus className="h-4 w-4" />
                <span>अभी पहला पोल बनाएं</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {polls.map((poll) => {
                const total = poll.totalVotes || 1;
                return (
                  <div
                    key={poll._id}
                    className={`rounded-2xl border transition-all p-5 lg:p-6 backdrop-blur-xl ${
                      poll.isActive
                        ? "border-emerald-500/40 bg-slate-900/90 shadow-xl shadow-emerald-950/20"
                        : "border-white/10 bg-slate-900/50 hover:border-white/20"
                    }`}
                  >
                    {/* Poll Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        {poll.isActive ? (
                          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-300">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            लाइव सक्रिय (Currently Live)
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-800 border border-white/10 px-3 py-1 text-[11px] font-semibold text-slate-400">
                            निष्क्रिय (Inactive)
                          </span>
                        )}
                        <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] text-slate-300">
                          {poll.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(poll.createdAt).toLocaleDateString("hi-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="font-bold text-white">
                          {poll.totalVotes.toLocaleString("hi-IN")} कुल वोट्स
                        </span>
                      </div>
                    </div>

                    {/* Question */}
                    <h3 className="text-lg font-bold text-white mb-4 leading-snug">
                      {poll.question}
                    </h3>

                    {/* Options Breakdown with Progress Bars */}
                    <div className="space-y-3 mb-6">
                      {poll.options.map((opt, i) => {
                        const pct =
                          poll.totalVotes > 0
                            ? Math.round((opt.votes / poll.totalVotes) * 100)
                            : 0;
                        const colorClass = barColors[i % barColors.length];

                        return (
                          <div key={opt.id} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-medium text-slate-200">{opt.text}</span>
                              <span className="font-mono font-bold text-slate-300">
                                {opt.votes} वोट ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${colorClass.split(" ")[0]}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(poll._id, poll.isActive)}
                          className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                            poll.isActive
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                              : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                          }`}
                        >
                          {poll.isActive ? (
                            <>
                              <ToggleRight className="h-4 w-4" />
                              <span>निष्क्रिय करें (Deactivate)</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-4 w-4" />
                              <span>लाइव करें (Make Active)</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleResetVotes(poll._id)}
                          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors"
                          title="सभी वोट 0 करें"
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                          <span>वोट रीसेट (Reset)</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeletePoll(poll._id)}
                        className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/40 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>हटाएं (Delete)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Poll Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white">
                    <Vote className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">नया जनमत सर्वेक्षण (Create Poll)</h3>
                    <p className="text-xs text-slate-400">पाठकों के लिए नया सवाल और विकल्प तैयार करें</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePoll} className="space-y-4">
                {/* Question */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    पोल का प्रश्न (Question) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g. क्या भारत को डिजिटल अर्थव्यवस्था और AI तकनीक में विश्व का नेतृत्व करना चाहिए?"
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Category & Expiry Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      श्रेणी (Category)
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    >
                      <option value="राष्ट्रीय">राष्ट्रीय (National)</option>
                      <option value="राजनीति">राजनीति (Politics)</option>
                      <option value="अर्थव्यवस्था">अर्थव्यवस्था (Economy)</option>
                      <option value="तकनीक">तकनीक (Technology)</option>
                      <option value="खेल">खेल (Sports)</option>
                      <option value="मनोरंजन">मनोरंजन (Entertainment)</option>
                      <option value="स्थानीय">स्थानीय (Local / State)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      समाप्ति तारीख (Optional Expiry)
                    </label>
                    <input
                      type="date"
                      value={newExpiresAt}
                      onChange={(e) => setNewExpiresAt(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Dynamic Options */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      विकल्प (Options) — कम से कम 2
                    </label>
                    <button
                      type="button"
                      onClick={handleAddOptionField}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ विकल्प जोड़ें</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {newOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 font-mono text-xs text-slate-400 font-bold">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`विकल्प ${idx + 1}`}
                          className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
                        />
                        {newOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionField(idx)}
                            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            title="विकल्प हटाएं"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Set Live Checkbox */}
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newIsActive}
                    onChange={(e) => setNewIsActive(e.target.checked)}
                    className="rounded accent-red-600 h-4 w-4"
                  />
                  <span className="text-xs text-slate-300 font-semibold">
                    इस पोल को तुरंत लाइव करें (Set this poll active on website now)
                  </span>
                </label>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-red-900/40 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>बनाया जा रहा है...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>पोल लाइव करें (Create Poll)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

