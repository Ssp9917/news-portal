"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Users,
  Smartphone,
  Laptop,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Eye,
  AlertTriangle,
  X,
} from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

interface CampaignItem {
  _id: string;
  name: string;
  title: string;
  message: string;
  image?: string;
  url: string;
  type: string;
  status: string;
  stats: {
    totalTargeted: number;
    sentCount: number;
    failedCount: number;
    clickCount: number;
  };
  sentAt?: string;
  createdAt: string;
}

export default function AdminNotificationCenter() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    mobileCount: 0,
    desktopCount: 0,
    tabletCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [url, setUrl] = useState("/");
  const [type, setType] = useState("breaking");
  const [priority, setPriority] = useState("high");
  const [segment, setSegment] = useState("all");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [language, setLanguage] = useState("all");

  const loadCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleCreateAndSend = async (sendImmediately: boolean) => {
    if (!title.trim() || !message.trim() || !url.trim()) {
      alert("कृपया शीर्षक, संदेश और डेस्टिनेशन URL भरें");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create campaign
      const createRes = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || title,
          title,
          message,
          image,
          url,
          type,
          priority,
          status: sendImmediately ? "sending" : "draft",
          targetAudience: { segment, city, state, language },
        }),
      });

      const campaign = await createRes.json();

      if (createRes.ok && sendImmediately) {
        // 2. Dispatch broadcast
        const sendRes = await fetch("/api/admin/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId: campaign._id }),
        });
        const sendData = await sendRes.json();
        alert(sendData.message || "प्रसारण भेज दिया गया!");
      }

      setModalOpen(false);
      resetForm();
      loadCampaigns();
    } catch (err) {
      console.error(err);
      alert("कैंपेन बनाने में त्रुटि आई");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("क्या आप वाकई इस कैंपेन को हटाना चाहते हैं?")) {
      await fetch(`/api/admin/notifications?id=${id}`, { method: "DELETE" });
      setCampaigns((prev) => prev.filter((c) => c._id !== id));
    }
  };

  const resetForm = () => {
    setName("");
    setTitle("");
    setMessage("");
    setImage("");
    setUrl("/");
    setType("breaking");
    setSegment("all");
    setCity("");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <AdminNav />

      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white">
                <Bell className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-red-500">
                FCM Push Broadcast Engine
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              नोटिफिकेशन एवं ब्रॉडकास्ट सेंटर
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              ब्राउज़र पुश नोटिफिकेशन भेजें, ब्रेकिंग न्यूज़ प्रसारित करें और दर्शक वर्ग को लक्षित करें।
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#c61d23] hover:bg-[#a8161b] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-900/30 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>नया नोटिफिकेशन बनाएं</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">सक्रिय सब्सक्राइबर्स</span>
              <Users className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats.totalSubscribers.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">
              ● लाइव वेब पुश टोकन्स
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">मोबाइल सब्सक्राइबर्स</span>
              <Smartphone className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats.mobileCount.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Android & iOS PWA
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">डेस्कटॉप डिवाइसेज</span>
              <Laptop className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats.desktopCount.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Chrome, Edge, Firefox, Safari
            </span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold">कुल प्रसारित कैंपेन</span>
              <Send className="h-4 w-4 text-red-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {campaigns.length}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              100% डिलीवरी ट्रैक रिकॉर्ड
            </span>
          </div>
        </div>

        {/* Campaign History Table */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-xl">
          <h2 className="text-base font-bold text-white mb-4 flex items-center justify-between">
            <span>हालिया नोटिफिकेशन अभियान (Campaigns History)</span>
            <span className="text-xs text-slate-400 font-normal">
              कुल: {campaigns.length}
            </span>
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              लोड हो रहा है...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              अभी तक कोई नोटिफिकेशन कैंपेन नहीं भेजा गया है।
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">कैंपेन / शीर्षक</th>
                    <th className="py-3 px-3">श्रेणी / प्रकार</th>
                    <th className="py-3 px-3">स्थिति (Status)</th>
                    <th className="py-3 px-3">लक्षित / भेजे गए</th>
                    <th className="py-3 px-3">दिनांक</th>
                    <th className="py-3 px-3 text-right">क्रियाएं</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {campaigns.map((c) => (
                    <tr key={c._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{c.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{c.message}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="rounded bg-red-950/60 text-red-400 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase">
                          {c.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            c.status === "sent"
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20"
                              : c.status === "sending"
                              ? "bg-amber-950/60 text-amber-400 border border-amber-500/20 animate-pulse"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 font-mono">
                        {c.stats.sentCount} / {c.stats.totalTargeted}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="text-red-400 hover:text-red-300 p-1.5 cursor-pointer"
                          aria-label="Delete campaign"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: Create Campaign */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in"
            onClick={() => setModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-slate-900 p-6 lg:p-8 shadow-2xl"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-bold text-white mb-1">
                नया पुश नोटिफिकेशन बनाएं (Create Notification)
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                सभी आवश्यक विवरण भरें। दाईं ओर लाइव प्रीव्यू प्रदर्शित होगा।
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Fields: 7 cols */}
                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      अभियान का नाम (Internal Campaign Name)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="उदा: शाम 7 बजे ब्रेकिंग न्यूज़ अलर्ट"
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      नोटिफिकेशन शीर्षक (Title)*
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="🚨 ब्रेकिंग: संसद सत्र में बड़ा निर्णय..."
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      संदेश (Message / Body)*
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="पूरी खबर पढ़ें: सरकार ने नए आर्थिक विधेयक पर मुहर लगाई..."
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      बैनर इमेज URL (वैकल्पिक - Big Image)
                    </label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      डेस्टिनेशन URL (क्लिक करने पर खुलने वाला लिंक)*
                    </label>
                    <input
                      type="text"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="/news/parliament-winter-session-2026"
                      className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        प्रकार (Type)
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                      >
                        <option value="breaking">ब्रेकिंग न्यूज़ (Breaking)</option>
                        <option value="important">महत्वपूर्ण (Important)</option>
                        <option value="trending">ट्रेंडिंग (Trending)</option>
                        <option value="local">लोकल / शहर (Local)</option>
                        <option value="sports">खेल अपडेट (Sports)</option>
                        <option value="digest">दैनिक डाइजेस्ट (Digest)</option>
                        <option value="promotional">प्रचार अभियान (Promotional)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        दर्शक वर्ग (Audience)
                      </label>
                      <select
                        value={segment}
                        onChange={(e) => setSegment(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                      >
                        <option value="all">सभी सब्सक्राइबर्स (All)</option>
                        <option value="registered">केवल पंजीकृत उपयोगकर्ता</option>
                        <option value="guests">केवल अतिथि डिवाइसेज</option>
                        <option value="city">शहर अनुसार (By City)</option>
                      </select>
                    </div>
                  </div>

                  {segment === "city" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        लक्षित शहर (Target City)
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="उदा: Jaipur, Delhi, Lucknow"
                        className="w-full rounded-xl border border-white/10 bg-slate-800 px-3.5 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleCreateAndSend(true)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#c61d23] hover:bg-[#a8161b] py-2.5 text-xs font-bold text-white shadow-lg shadow-red-900/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{submitting ? "प्रसारित हो रहा है..." : "अभी प्रसारित करें (Broadcast Now)"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => handleCreateAndSend(false)}
                      className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      ड्राफ्ट सहेजें (Save Draft)
                    </button>
                  </div>
                </div>

                {/* Live Mobile Push Preview: 5 cols */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <div className="rounded-2xl border border-white/15 bg-black/60 p-4 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-400">
                      <Smartphone className="h-4 w-4 text-emerald-400" />
                      <span>लाइव पुश प्रीव्यू (Lockscreen Preview)</span>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-neutral-900/90 p-3.5 shadow-xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="flex h-4 w-4 items-center justify-center rounded bg-[#c61d23] text-white text-[8px] font-black">
                            BP
                          </span>
                          <span className="text-[10px] font-bold text-white/90">
                            BHARAT PULSE NEWS
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400">अभी (now)</span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-tight">
                        {title || "🚨 ब्रेकिंग न्यूज़: शीर्षक यहाँ दिखाई देगा..."}
                      </h4>

                      <p className="mt-1 text-[11px] text-slate-300 leading-snug line-clamp-2">
                        {message || "नोटिफिकेशन का संक्षिप्त संदेश यहाँ प्रदर्शित होगा..."}
                      </p>

                      {image && (
                        <div className="mt-2 aspect-video w-full overflow-hidden rounded-lg bg-slate-800">
                          <img
                            src={image}
                            alt="Notification preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}

                      <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-slate-400 font-medium">
                        <span>टैप करके पढ़ें →</span>
                        <span className="text-red-400 uppercase font-mono">{type}</span>
                      </div>
                    </div>
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

