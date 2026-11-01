"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Heart, Send, CheckCircle2, AlertCircle, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface CommentItem {
  _id: string;
  authorName: string;
  content: string;
  createdAt: string;
  likes: number;
}

interface ArticleCommentsProps {
  articleId: string;
  articleSlug: string;
}

export default function ArticleComments({ articleId, articleSlug }: ArticleCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (user) {
      setAuthorName(user.name || "");
      setAuthorEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    fetch(`/api/comments?articleSlug=${encodeURIComponent(articleSlug)}&articleId=${encodeURIComponent(articleId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.comments) setComments(data.comments);
      })
      .catch(() => {});
  }, [articleId, articleSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim() || !authorEmail.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          articleSlug,
          content,
          authorName,
          authorEmail,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, type: "success" });
        if (data.comment?.isApproved) {
          setComments((prev) => [data.comment, ...prev]);
        }
        setContent("");
      } else {
        setMessage({ text: data.message || "त्रुटि आई", type: "error" });
      }
    } catch {
      setMessage({ text: "नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    const voterId = typeof window !== "undefined" ? localStorage.getItem("bp_visitor_id") || "v_" + Date.now() : "";
    try {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, voterIdentifier: voterId }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, likes: data.likes } : c))
        );
      }
    } catch {}
  };

  return (
    <section aria-label="पाठक टिप्पणियां" className="mt-12 border-t border-gray-200 dark:border-neutral-800 pt-8">
      <div className="flex items-center gap-2.5 mb-6">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
          <MessageSquare className="h-4 w-4" />
        </span>
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          पाठकों के विचार ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm space-y-3.5">
        <h4 className="text-xs font-bold text-gray-800 dark:text-neutral-200">
          अपनी राय लिखें (Share Your Thoughts)
        </h4>

        {message && (
          <div
            className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-500/20"
                : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-500/20"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span>{message.text}</span>
          </div>
        )}

        <textarea
          required
          rows={3}
          maxLength={1000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="समाचार पर अपनी निष्पक्ष राय यहां साझा करें..."
          className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 p-3 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] focus:outline-none"
        />

        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>आचार संहिता का पालन करें • भाषा की गरिमा बनाए रखें</span>
          <span>{content.length}/1000</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="आपका नाम (Your Name)"
            className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] focus:outline-none"
          />
          <input
            type="email"
            required
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="ईमेल (गोपनीय रहेगा)"
            className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#c61d23] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#c61d23] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#a8161b] transition-all cursor-pointer disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          <span>{submitting ? "भेजा जा रहा है..." : "टिप्पणी पोस्ट करें"}</span>
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="py-6 text-center text-xs text-gray-500">
            इस लेख पर अभी तक कोई टिप्पणी नहीं है। पहली टिप्पणी करें!
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment._id}
              className="rounded-xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60 text-[#c61d23] text-xs font-bold">
                    {comment.authorName[0]?.toUpperCase() || "U"}
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                      {comment.authorName}
                    </h5>
                    <span className="text-[10px] text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleLike(comment._id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Heart className="h-3.5 w-3.5 fill-current text-red-500/80" />
                  <span>{comment.likes || 0}</span>
                </button>
              </div>

              <p className="text-xs leading-relaxed text-gray-700 dark:text-neutral-300">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

