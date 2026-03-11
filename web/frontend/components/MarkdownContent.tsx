"use client";

import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  isLoading?: boolean;
}

/**
 * Renders markdown content with GFM table support and prose styling.
 * Memoized to avoid re-renders from parent state changes.
 */
export const MarkdownContent = React.memo(
  function MarkdownContent({ content, isLoading = false }: MarkdownContentProps) {
    const processedContent = useMemo(() => {
      return content;
    }, [content]);

    if (isLoading) {
      return (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-700 rounded w-4/5"></div>
        </div>
      );
    }

    return (
      <article className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {processedContent}
        </ReactMarkdown>
      </article>
    );
  }
);
