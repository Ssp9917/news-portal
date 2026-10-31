"use client";

import { useState } from "react";
import ArticleReaderControls from "./ArticleReaderControls";
import TableOfContents from "./TableOfContents";
import AdPlacement from "@/components/homepage/AdPlacement";

interface ArticleBodyContainerProps {
  contentHtml: string;
}

export default function ArticleBodyContainer({
  contentHtml,
}: ArticleBodyContainerProps) {
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");

  const fontClasses = {
    sm: "text-base leading-relaxed",
    base: "text-lg leading-relaxed",
    lg: "text-xl leading-loose",
    xl: "text-2xl leading-loose",
  };

  return (
    <div>
      {/* Top Controls Bar */}
      <div className="mb-6 flex items-center justify-between">
        <ArticleReaderControls
          currentSize={fontSize}
          onFontSizeChange={setFontSize}
        />
      </div>

      {/* Auto Table of Contents */}
      <TableOfContents contentHtml={contentHtml} />

      {/* Article Rich Content */}
      <div
        id="article-body-content"
        className={`prose prose-slate dark:prose-invert max-w-none font-normal text-slate-800 dark:text-slate-200 transition-all ${fontClasses[fontSize]} [&>p]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:text-slate-900 dark:[&>h2]:text-white [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-8 [&>h3]:mb-3 [&>blockquote]:border-l-4 [&>blockquote]:border-blue-600 [&>blockquote]:pl-5 [&>blockquote]:italic [&>blockquote]:my-6 [&>blockquote]:text-slate-600 dark:[&>blockquote]:text-slate-300 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-4`}
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      {/* In-Content Dynamic Advertisement Slot */}
      <div className="my-8">
        <AdPlacement slot="article_content" />
      </div>
    </div>
  );
}
