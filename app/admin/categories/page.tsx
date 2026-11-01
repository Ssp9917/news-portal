"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  X,
  Search,
  Globe,
  Landmark,
  Cpu,
  Trophy,
  TrendingUp,
  HeartPulse,
  GraduationCap,
  Film,
  Car,
  CloudRain,
  Flame,
  FileCheck2,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Role } from "@/lib/auth/rbac";

interface CategoryItem {
  _id?: string;
  name: string;
  nameI18n?: {
    hi?: string;
    en?: string;
    bn?: string;
  };
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  order: number;
  isVisible: boolean;
  isNav: boolean;
  seo?: {
    title?: string;
    description?: string;
  };
}

const AVAILABLE_ICONS = [
  { name: "Flame", label: "Flame / Breaking", icon: Flame },
  { name: "Globe", label: "Globe / World", icon: Globe },
  { name: "Landmark", label: "Landmark / Politics", icon: Landmark },
  { name: "TrendingUp", label: "Trending / Business", icon: TrendingUp },
  { name: "Cpu", label: "Cpu / Tech", icon: Cpu },
  { name: "Trophy", label: "Trophy / Sports", icon: Trophy },
  { name: "HeartPulse", label: "Heart / Health", icon: HeartPulse },
  { name: "GraduationCap", label: "Education", icon: GraduationCap },
  { name: "Film", label: "Entertainment", icon: Film },
  { name: "FileCheck2", label: "Schemes / Govt", icon: FileCheck2 },
  { name: "Car", label: "Automobile", icon: Car },
  { name: "CloudRain", label: "Weather", icon: CloudRain },
];

export default function CategoryManagerPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
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

  const openCreateModal = () => {
    setEditingCategory({
      name: "",
      nameI18n: { hi: "", en: "", bn: "" },
      slug: "",
      description: "",
      color: "from-blue-600 to-indigo-700",
      icon: "Flame",
      order: categories.length + 1,
      isVisible: true,
      isNav: true,
      seo: { title: "", description: "" },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory({ ...cat });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setSaving(true);

    try {
      const token = localStorage.getItem("admin_token");
      const isEdit = Boolean(editingCategory._id);
      const url = isEdit
        ? `/api/admin/categories/${editingCategory._id}`
        : "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingCategory),
      });

      if (res.ok) {
        showToast(
          isEdit ? "Category updated successfully!" : "Category created successfully!"
        );
        setIsModalOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        showToast(err.message || "Operation failed");
      }
    } catch {
      showToast("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showToast("Category deleted successfully");
        setCategories(categories.filter((c) => c._id !== id));
      } else {
        showToast("Failed to delete category");
      }
    } catch {
      showToast("Network error");
    }
  };

  const filteredCategories = categories.filter((c) =>
    (c.name + " " + (c.nameI18n?.en || "") + " " + c.slug)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <FolderTree className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
                Category Manager
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Create, organize, and manage multilingual categories, colors, icons, and SEO metadata.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Stats */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search categories by name, English title, or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none backdrop-blur-md"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Total Categories:</span>
            <span className="font-bold text-white font-mono">{categories.length}</span>
          </div>
        </div>

        {/* Categories Table / Card Grid */}
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <table className="w-full text-left text-xs min-w-[640px]">
            <thead className="border-b border-white/10 bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Priority</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">English Name</th>
                <th className="py-3.5 px-4 font-semibold">URL Slug</th>
                <th className="py-3.5 px-4 font-semibold">Icon</th>
                <th className="py-3.5 px-4 font-semibold">Nav</th>
                <th className="py-3.5 px-4 font-semibold">Visibility</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {filteredCategories.map((cat) => {
                const iconObj = AVAILABLE_ICONS.find((i) => i.name === cat.icon);
                const IconComponent = iconObj?.icon || FolderTree;

                return (
                  <tr
                    key={cat._id || cat.slug}
                    className="hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                      #{cat.order}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr ${
                            cat.color || "from-blue-600 to-indigo-700"
                          } text-white shadow`}
                        >
                          <IconComponent className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm">
                            {cat.name}
                          </span>
                          {cat.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {cat.nameI18n?.en || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      /{cat.slug}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {cat.icon || "Default"}
                    </td>
                    <td className="py-3.5 px-4">
                      {cat.isNav ? (
                        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                          Header Nav
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Hidden</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {cat.isVisible ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                          <Eye className="h-3.5 w-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-500 font-semibold text-[11px]">
                          <EyeOff className="h-3.5 w-3.5" />
                          <span>Draft</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
                          title="Edit Category"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => cat._id && handleDeleteCategory(cat._id)}
                          className="rounded-lg border border-red-500/20 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20"
                          title="Delete Category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal: Add / Edit Category */}
        {isModalOpen && editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-slate-950 p-6 shadow-2xl backdrop-blur-2xl">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white">
                  {editingCategory._id ? "Edit Category" : "Add New Category"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                {/* Hindi Name & English Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-300">
                      Hindi Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          name: e.target.value,
                          nameI18n: {
                            ...editingCategory.nameI18n,
                            hi: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. राजनीति"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-slate-300">
                      English Name
                    </label>
                    <input
                      type="text"
                      value={editingCategory.nameI18n?.en || ""}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          nameI18n: {
                            ...editingCategory.nameI18n,
                            en: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Politics"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Slug & Order */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block font-semibold text-slate-300">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCategory.slug}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                        })
                      }
                      placeholder="e.g. politics"
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 font-mono text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block font-semibold text-slate-300">
                      Display Order Priority
                    </label>
                    <input
                      type="number"
                      value={editingCategory.order}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="mb-1 block font-semibold text-slate-300">
                    Category Icon
                  </label>
                  <select
                    value={editingCategory.icon || "Flame"}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        icon: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    {AVAILABLE_ICONS.map((i) => (
                      <option key={i.name} value={i.name}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-1 block font-semibold text-slate-300">
                    Category Description
                  </label>
                  <textarea
                    rows={2}
                    value={editingCategory.description || ""}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        description: e.target.value,
                      })
                    }
                    placeholder="Short summary of this editorial beat..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCategory.isVisible}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          isVisible: e.target.checked,
                        })
                      }
                      className="rounded accent-blue-600"
                    />
                    <span className="font-semibold text-white">Visible on Site</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCategory.isNav}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          isNav: e.target.checked,
                        })
                      }
                      className="rounded accent-blue-600"
                    />
                    <span className="font-semibold text-white">Show in Header Nav</span>
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-white/10 px-4 py-2 font-semibold text-slate-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "Saving..." : "Save Category"}</span>
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
