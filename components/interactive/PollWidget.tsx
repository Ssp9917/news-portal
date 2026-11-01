"use client";

import { useState, useEffect } from "react";
import { Vote, CheckCircle2, BarChart3, Sparkles } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface PollData {
  _id: string;
  question: string;
  category: string;
  options: PollOption[];
  totalVotes: number;
}

const LOCAL_VOTES_KEY = "bharat_pulse_voted_polls";

export default function PollWidget() {
  const { user } = useAuth();
  const [poll, setPoll] = useState<PollData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/polls")
      .then((res) => res.json())
      .then((data) => {
        if (data && data._id) {
          setPoll(data);

          // Check if user or browser already voted
          if (typeof window !== "undefined") {
            try {
              const votedList = JSON.parse(localStorage.getItem(LOCAL_VOTES_KEY) || "[]");
              if (votedList.includes(data._id)) {
                setHasVoted(true);
              }
            } catch {}
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleVote = async () => {
    if (!selectedOption || !poll || hasVoted || submitting) return;

    setSubmitting(true);
    try {
      const visitorToken = typeof window !== "undefined" ? localStorage.getItem("bp_visitor_id") || "v_" + Date.now() : "";

      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pollId: poll._id,
          optionId: selectedOption,
          voterToken: visitorToken,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPoll(data.poll);
        setHasVoted(true);

        if (typeof window !== "undefined") {
          try {
            const votedList = JSON.parse(localStorage.getItem(LOCAL_VOTES_KEY) || "[]");
            votedList.push(poll._id);
            localStorage.setItem(LOCAL_VOTES_KEY, JSON.stringify(votedList));
          } catch {}
        }
      }
    } catch (err) {
      console.error("Voting error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!poll) return null;

  const total = poll.totalVotes || 1;

  return (
    <aside
      aria-label="जनता की राय (Public Opinion Poll)"
      className="mb-10 overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-white via-blue-50/20 to-slate-50 dark:from-neutral-900 dark:via-blue-950/20 dark:to-neutral-900 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3 border-b border-gray-100 dark:border-neutral-800 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-white">
            <Vote className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
            जनता की राय (Reader Opinion Poll)
          </span>
        </div>
        <span className="rounded bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
          {poll.category}
        </span>
      </div>

      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-snug mb-4">
        {poll.question}
      </h3>

      <div className="space-y-2.5">
        {poll.options.map((opt) => {
          const pct = Math.round((opt.votes / total) * 100);
          const isSelected = selectedOption === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => !hasVoted && setSelectedOption(opt.id)}
              className={`relative overflow-hidden rounded-xl border p-3 transition-all ${
                hasVoted
                  ? "border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-800/60"
                  : isSelected
                  ? "border-[#c61d23] bg-red-50/60 dark:bg-red-950/30 cursor-pointer shadow-sm"
                  : "border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/40 hover:border-gray-400 cursor-pointer"
              }`}
            >
              {/* Progress bar background when voted */}
              {hasVoted && (
                <div
                  className="absolute inset-y-0 left-0 bg-red-500/15 dark:bg-red-500/25 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              )}

              <div className="relative flex items-center justify-between text-xs font-semibold text-gray-800 dark:text-neutral-200">
                <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                  {!hasVoted && (
                    <span
                      className={`h-3.5 w-3.5 shrink-0 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-[#c61d23] bg-[#c61d23]" : "border-gray-400"
                      }`}
                    >
                      {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </span>
                  )}
                  <span className="truncate">{opt.text}</span>
                </div>

                {hasVoted && (
                  <span className="text-xs font-black text-gray-900 dark:text-white shrink-0">
                    {pct}% <span className="text-[10px] text-gray-400 font-normal">({opt.votes})</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between pt-2 border-t border-gray-100 dark:border-neutral-800 text-[11px] text-gray-500">
        <span>कुल वोट: {poll.totalVotes}</span>
        {hasVoted ? (
          <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>वोट दर्ज हो गया</span>
          </span>
        ) : (
          <button
            onClick={handleVote}
            disabled={!selectedOption || submitting}
            className="rounded-lg bg-[#c61d23] px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-[#a8161b] transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? "दर्ज हो रहा है..." : "वोट दें (Submit Vote)"}
          </button>
        )}
      </div>
    </aside>
  );
}

