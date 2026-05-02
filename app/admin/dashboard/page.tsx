"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Video,
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
    if (!confirm("Delete this article? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/news/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setNews(news.filter((item) => item._id !== id));
      } else {
        alert("Could not delete the article.");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    document.cookie =
      "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/admin");
  };

  const totalArticles = news.length;
  const publishedArticles = news.length;
  const draftArticles = 0;
  const breakingArticles = news.filter((n) => n.isBreaking).length;

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-[#111827] text-white shadow-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded bg-[#D32F2F] p-1.5">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Admin</h1>
              <p className="hidden text-xs text-gray-400 sm:block">
                News portal dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/bn"
              target="_blank"
              className="flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
            >
              <span className="hidden sm:inline">View site</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mb-8 lg:grid-cols-4 lg:gap-6">
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total articles</p>
              <p className="text-2xl font-bold text-gray-900">{totalArticles}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {publishedArticles}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <Edit3 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{draftArticles}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Breaking</p>
              <p className="text-2xl font-bold text-gray-900">
                {breakingArticles}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search articles…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#111827]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            href="/admin/add-news"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 md:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>New article</span>
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Title
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredNews.map((item) => (
                  <tr key={item._id} className="group transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex min-w-[280px] items-center gap-3">
                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                          {item.image && (
                            <Image
                              src={item.image}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <span className="line-clamp-2 font-medium text-gray-900" title={item.title}>
                          {item.title}
                          {item.videoUrl && (
                            <Video className="ml-2 inline-block h-3.5 w-3.5 text-blue-500" />
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {item.isBreaking ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          <Zap className="h-3 w-3" /> Breaking
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Published
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          href={`/admin/edit-news?id=${item._id}`}
                          className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteNews(item._id)}
                          className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredNews.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <FileText className="mb-3 h-12 w-12 text-gray-200" />
                        <p>No articles yet. Create your first article.</p>
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
