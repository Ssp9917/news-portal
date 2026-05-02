/** Category labels shown in English in admin; stored values remain Bangla for the public site/API. */

export type AdminCategoryOption = {
  label: string;
  value: string;
  color: string;
};

export const ADMIN_NEWS_CATEGORIES: AdminCategoryOption[] = [
  { label: "Cover", value: "প্রচ্ছদ", color: "bg-gray-500" },
  { label: "National news", value: "দেশের খবর", color: "bg-teal-500" },
  { label: "Politics", value: "রাজনীতি", color: "bg-red-500" },
  { label: "Sports", value: "খেলাধুলা", color: "bg-green-500" },
  { label: "Technology", value: "প্রযুক্তি", color: "bg-blue-500" },
  { label: "Business", value: "বাণিজ্য", color: "bg-orange-500" },
  { label: "Entertainment", value: "বিনোদন", color: "bg-pink-500" },
  { label: "Health", value: "স্বাস্থ্য", color: "bg-rose-400" },
  { label: "Education", value: "শিক্ষা", color: "bg-yellow-500" },
  { label: "Crime", value: "অপরাধ", color: "bg-slate-700" },
  { label: "Social", value: "সামাজিক", color: "bg-indigo-500" },
  { label: "World", value: "বিশ্ব", color: "bg-purple-500" },
];
