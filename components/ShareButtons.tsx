"use client";

import { useState } from "react";
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";

interface ShareButtonsProps {
  title: string;
  size?: "sm" | "lg";
}

export default function ShareButtons({ title, size = "sm" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const handleCopy = () => {
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };

  const handleShare = (platform: string) => {
    if (typeof window === "undefined") return;

    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${text}&body=${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const btnClass = size === "lg" ? "w-10 h-10" : "w-8 h-8";

  const iconClass = size === "lg" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => handleShare("facebook")}
        title={t("shareButtons.facebook")}
        className={`${btnClass} flex items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-[#1877F2] hover:text-white dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-[#1877F2]`}
      >
        <Facebook className={iconClass} />
      </button>

      <button
        type="button"
        onClick={() => handleShare("twitter")}
        title={t("shareButtons.twitter")}
        className={`${btnClass} flex items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-[#1DA1F2] hover:text-white dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-[#1DA1F2]`}
      >
        <Twitter className={iconClass} />
      </button>

      <button
        type="button"
        onClick={() => handleShare("linkedin")}
        title={t("shareButtons.linkedin")}
        className={`${btnClass} flex items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-[#0A66C2] hover:text-white dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-[#0A66C2]`}
      >
        <Linkedin className={iconClass} />
      </button>

      <button
        type="button"
        onClick={() => handleShare("email")}
        title={t("shareButtons.email")}
        className={`${btnClass} flex items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-gray-800 hover:text-white dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-600`}
      >
        <Mail className={iconClass} />
      </button>

      <div className="group relative">
        <button
          type="button"
          onClick={handleCopy}
          title={t("shareButtons.copyTooltip")}
          className={`${btnClass} flex items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-all hover:bg-[#D32F2F] hover:text-white dark:bg-neutral-800 dark:text-neutral-200 ${copied ? "!bg-green-500 !text-white" : ""}`}
        >
          {copied ? <Check className={iconClass} /> : <LinkIcon className={iconClass} />}
        </button>

        <div
          className={`pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg transition-opacity duration-200 dark:bg-neutral-700 ${copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        >
          {copied ? t("shareButtons.copied") : t("shareButtons.copyTooltip")}
          <div className="absolute left-1/2 top-full -mt-1 -translate-x-1/2 border-4 border-transparent border-t-gray-800 dark:border-t-neutral-700" />
        </div>
      </div>
    </div>
  );
}
