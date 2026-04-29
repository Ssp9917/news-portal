"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/Logo-01.png";
import { 
  FileText, 
  Eye, 
  Edit3, 
  Zap, 
  Search, 
  Plus, 
  LogOut, 
  ExternalLink,
  Trash2,
  Edit,
  Video
} from "lucide-react";

interface NewsItem {
  _id: string;
  title: string;
  category: string;
  date: string;
  image?: string;
  isBreaking?: boolean;
  videoUrl?: string;
}

export default function AdminDashboard() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Basic protection check
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }

    fetchNews();
  }, [router]);

  const fetchNews = async () => {
    try {
      const res = await fetch(`/api/news`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch news: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setNews(data);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const deleteNews = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিত যে আপনি এই খবরটি মুছে ফেলতে চান?")) return;

    try {
      const res = await fetch(`/api/news/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNews(news.filter((item) => item._id !== id));
      } else {
        alert("খবর মুছতে সমস্যা হয়েছে");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/admin");
  };

  // Derived Statistics
  const totalArticles = news.length;
  const publishedArticles = news.length;
  const draftArticles = 0;
  const breakingArticles = news.filter(n => n.isBreaking).length;

  // Filtered News
  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-anek text-gray-900">
      {/* Top Navbar */}
      <nav className="bg-[#111827] text-white shadow-md">
        <div className="container mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-[#D32F2F] p-1.5 rounded">
                <FileText className="w-5 h-5 text-white" />
             </div>
             <div>
                 <h1 className="font-bold text-lg leading-tight">Admin</h1>
                 <p className="text-xs text-gray-400 hidden sm:block">NewsPortal Management</p>
             </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
             <Link href="/" target="_blank" className="text-gray-300 hover:text-white flex items-center gap-2 text-sm transition-colors">
                <span className="hidden sm:inline">সাইট দেখুন</span>
                <ExternalLink className="w-4 h-4" />
             </Link>
             <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white flex items-center gap-2 text-sm transition-colors"
                >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                    <FileText className="w-6 h-6" />
                </div>
                <div>
                     <p className="text-sm text-gray-500 font-medium">মোট সংবাদ</p>
                     <p className="text-2xl font-bold text-gray-900">{totalArticles}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                    <Eye className="w-6 h-6" />
                </div>
                <div>
                     <p className="text-sm text-gray-500 font-medium">প্রকাশিত</p>
                     <p className="text-2xl font-bold text-gray-900">{publishedArticles}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                    <Edit3 className="w-6 h-6" />
                </div>
                <div>
                     <p className="text-sm text-gray-500 font-medium">খসড়া</p>
                     <p className="text-2xl font-bold text-gray-900">{draftArticles}</p>
                </div>
            </div>
             <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                    <Zap className="w-6 h-6" />
                </div>
                <div>
                     <p className="text-sm text-gray-500 font-medium">ব্রেকিং</p>
                     <p className="text-2xl font-bold text-gray-900">{breakingArticles}</p>
                </div>
            </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input 
                    type="text" 
                    placeholder="সংবাদ খুঁজুন..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#111827] focus:border-transparent bg-white text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Link
                href="/admin/add-news"
                className="bg-[#111827] hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm w-full md:w-auto justify-center"
            >
                <Plus className="w-4 h-4" />
                <span>নতুন সংবাদ</span>
            </Link>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">শিরোনাম</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ক্যাটাগরি</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">অবস্থা</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">তারিখ</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">অ্যাকশন</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                {filteredNews.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3 min-w-[280px]">
                            <div className="w-10 h-10 relative bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                {item.image && (
                                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                                )}
                            </div>
                            <span className="font-medium text-gray-900 line-clamp-2" title={item.title}>
                                {item.title}
                                {item.videoUrl && (
                                    <Video className="w-3.5 h-3.5 inline-block ml-2 text-blue-500" />
                                )}
                            </span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.category}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {item.isBreaking ? (
                             <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <Zap className="w-3 h-3" /> Breaking
                             </span>
                        ) : (
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Published
                             </span>
                        )}
                       
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm whitespace-nowrap">
                        {item.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                            href={`/admin/edit-news?id=${item._id}`}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600 transition-colors"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => deleteNews(item._id)}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600 transition-colors"
                             title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                {filteredNews.length === 0 && (
                    <tr>
                    <td colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                             <FileText className="w-12 h-12 mb-3 text-gray-200" />
                            <p>কোনো সংবাদ পাওয়া যায়নি। আপনার প্রথম সংবাদটি তৈরি করুন!</p>
                        </div>
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
      </main>
    </div>
  );
}
