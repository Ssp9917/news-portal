"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  AlertTriangle,
  User,
  Clock,
  ShieldAlert,
} from "lucide-react";
import type { Role } from "@/lib/auth/rbac";

interface CommentItem {
  _id: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: boolean;
  reported: boolean;
  likes: number;
  createdAt: string;
}

export default function AdminCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, reported: 0 });
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "reported">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ email: string; name?: string; role: Role } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchComments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.push("/admin");
        return;
      }

      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/comments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        if (data.stats) setStats(data.stats);
      } else {
        showToast("टिप्पणियां लोड नहीं हो पाईं");
      }
    } catch {
      showToast("नेटवर्क त्रुटि: टिप्पणियां लोड करने में विफलता");
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

    fetch("/api/admin/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    fetchComments();
  }, [router, statusFilter]);

  const handleToggleApproval = async (commentId: string, currentApproved: boolean) => {
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          commentId,
          isApproved: !currentApproved,
        }),
      });

      if (res.ok) {
        showToast(!currentApproved ? "टिप्पणी स्वीकृत व लाइव कर दी गई!" : "टिप्पणी को छिपा दिया गया");
        fetchComments();
      } else {
        showToast("स्टेटस अपडेट नहीं हो पाया");
      }
    } catch {
      showToast("नेटवर्क त्रुटि");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("क्या आप सचमुच इस टिप्पणी को हमेशा के लिए हटाना चाहते हैं?")) {
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/comments?id=${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast("टिप्पणी सफलतापूर्वक हटा दी गई");
        fetchComments();
      } else {
        showToast("डिलीट नहीं हो सकी");
      }
    } catch {
      showToast("नेटवर्क त्रुटि");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
      <AdminNav currentUser={currentUser} />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 mb-1">
              <MessageSquare className="h-4 w-4" />
              <span>Reader Discussion & Moderation</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              पाठक टिप्पणियां / Comments Moderation
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              आर्टिकल्स पर पाठकों के विचार, लाइक और टिप्पणियां देखें, स्वीकृत करें या मॉडरेशन करें
            </p>
          </div>

          <button
            onClick={fetchComments}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors w-fit"
            title="रीफ्रेश करें"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/90 px-4 py-3 text-xs font-semibold text-emerald-200 shadow-2xl backdrop-blur-xl animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-5 backdrop-blur-xl">
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider block mb-1">
              कुल टिप्पणियां
            </span>
            <div className="text-2xl lg:text-3xl font-black text-white">{stats.total}</div>
            <p className="text-[11px] text-slate-400 mt-1">सभी प्रकाशित आर्टिकल्स पर</p>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-950/20 p-5 backdrop-blur-xl">
            <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block mb-1">
              लंबित समीक्षा (Pending)
            </span>
            <div className="text-2xl lg:text-3xl font-black text-amber-400">{stats.pending}</div>
            <p className="text-[11px] text-slate-400 mt-1">स्वीकृति की प्रतीक्षा में</p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-5 backdrop-blur-xl">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block mb-1">
              स्वीकृत व लाइव
            </span>
            <div className="text-2xl lg:text-3xl font-black text-emerald-400">{stats.approved}</div>
            <p className="text-[11px] text-slate-400 mt-1">वेबसाइट पर दृश्यमान</p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-5 backdrop-blur-xl">
            <span className="text-xs text-red-400 font-bold uppercase tracking-wider block mb-1">
              फ्लैग्ड / स्पैम
            </span>
            <div className="text-2xl lg:text-3xl font-black text-red-400">{stats.reported}</div>
            <p className="text-[11px] text-slate-400 mt-1">स्पैम या अनुचित भाषा</p>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex border-b border-white/10 gap-1 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              सभी ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                statusFilter === "pending"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              लंबित ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                statusFilter === "approved"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              स्वीकृत ({stats.approved})
            </button>
            <button
              onClick={() => setStatusFilter("reported")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                statusFilter === "reported"
                  ? "bg-red-500/20 text-red-300 border border-red-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              फ्लैग्ड ({stats.reported})
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchComments();
            }}
            className="relative min-w-[240px]"
          >
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="नाम, ईमेल या टिप्पणी खोजें..."
              className="w-full rounded-xl border border-white/10 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-red-500 focus:outline-none"
            />
          </form>
        </div>

        {/* Comments Feed / Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin text-red-500 mb-3" />
            <p className="text-sm">टिप्पणियां लोड हो रही हैं...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/5 p-8">
            <MessageSquare className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">कोई टिप्पणी नहीं मिली</h3>
            <p className="text-xs text-slate-400 mt-1">
              {search ? "खोजे गए शब्दों के लिए कोई परिणाम नहीं मिला।" : "इस श्रेणी में अभी कोई टिप्पणी दर्ज नहीं है।"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl space-y-3 hover:border-white/20 transition-all"
              >
                {/* Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white font-bold text-xs shadow-md">
                      {comment.authorName[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{comment.authorName}</span>
                        {comment.isApproved ? (
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            लाइव स्वीकृत
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            लंबित समीक्षा
                          </span>
                        )}
                        {comment.reported && (
                          <span className="rounded-full bg-red-500/20 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-300 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>रिपोर्टेड स्पैम</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">{comment.authorEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString("hi-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Article Reference */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-slate-500">आर्टिकल:</span>
                  <Link
                    href={`/hi/news/${comment.articleSlug || comment.articleId}`}
                    target="_blank"
                    className="text-blue-400 hover:underline flex items-center gap-1 font-medium truncate max-w-lg"
                  >
                    <span>{comment.articleTitle}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </Link>
                </div>

                {/* Comment Text */}
                <div className="rounded-xl bg-slate-950/70 p-3.5 text-xs text-slate-200 leading-relaxed font-sans border border-white/5">
                  {comment.content}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-slate-400 font-mono">
                    ❤️ {comment.likes || 0} लाइक्स
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleApproval(comment._id, comment.isApproved)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                        comment.isApproved
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30"
                          : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md"
                      }`}
                    >
                      {comment.isApproved ? (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          <span>छिपाएं (Reject)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>स्वीकृत करें (Approve)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment._id)}
                      className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-950/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>हटाएं (Delete)</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
