"use client";

import { useEffect, useState } from "react";
import { ListCollapse, ChevronRight } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ contentHtml }: { contentHtml: string }) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from DOM inside the article
    const articleEl = document.getElementById("article-body-content");
    if (!articleEl) return;

    const headingEls = articleEl.querySelectorAll("h2, h3");
    const items: TocItem[] = [];

    headingEls.forEach((el, index) => {
      const text = el.textContent || "";
      let id = el.id;
      if (!id) {
        id = `heading-${index}`;
        el.id = id;
      }
      items.push({
        id,
        text,
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    setHeadings(items);

    // Intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [contentHtml]);

  if (headings.length < 2) return null;

  return (
    <div className="mb-8 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/60 p-5 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        <ListCollapse className="h-4 w-4 text-blue-500" />
        <span>लेख के मुख्य बिंदु (Table of Contents)</span>
      </div>

      <nav className="space-y-1.5 text-xs">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`flex items-center gap-1.5 py-1 transition-colors ${
              h.level === 3 ? "pl-4 text-slate-500" : "font-semibold text-slate-700 dark:text-slate-200"
            } ${
              activeId === h.id
                ? "text-blue-600 dark:text-blue-400 font-bold"
                : "hover:text-blue-600 dark:hover:text-blue-400"
            }`}
          >
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
            <span className="truncate">{h.text}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
