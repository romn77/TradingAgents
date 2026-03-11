"use client";

import { useState, useEffect, useCallback } from "react";
import { getStructure, getContent, ReportStructure } from "@/lib/api";
import { MarkdownContent } from "./MarkdownContent";

interface ReportViewerProps {
  reportId: string;
}

const CATEGORY_MAP: Record<string, { dir: string; label: string }> = {
  analysts: { dir: "1_analysts", label: "Analysts" },
  research: { dir: "2_research", label: "Research" },
  trading: { dir: "3_trading", label: "Trading" },
  risk: { dir: "4_risk", label: "Risk" },
  portfolio: { dir: "5_portfolio", label: "Portfolio" },
};

const FILE_LABELS: Record<string, string> = {
  market: "Market Analyst",
  sentiment: "Social Analyst",
  news: "News Analyst",
  fundamentals: "Fundamentals Analyst",
  bull: "Bull Researcher",
  bear: "Bear Researcher",
  manager: "Research Manager",
  trader: "Trader",
  aggressive: "Aggressive",
  conservative: "Conservative",
  neutral: "Neutral",
  decision: "Portfolio Decision",
};

export function ReportViewer({ reportId }: ReportViewerProps) {
  const [structure, setStructure] = useState<ReportStructure | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("complete");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch structure when reportId changes
  useEffect(() => {
    const loadStructure = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getStructure(reportId);
        setStructure(data);
        setSelectedTab("complete");
        setSelectedFile(null);
        setContent("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report");
        setStructure(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadStructure();
  }, [reportId]);

  // Fetch content when selectedTab or selectedFile changes
  useEffect(() => {
    const loadContent = async () => {
      if (!structure) return;

      let path: string;

      if (selectedTab === "complete") {
        path = "complete_report.md";
      } else {
        const categoryKey = selectedTab;
        const categoryInfo = CATEGORY_MAP[categoryKey];
        if (!categoryInfo || !selectedFile) {
          setContent("");
          return;
        }
        path = `${categoryInfo.dir}/${selectedFile}.md`;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await getContent(reportId, path);
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
        setContent("");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [reportId, selectedTab, selectedFile, structure]);

  // When switching tabs, auto-select first file if category has files
  const handleTabChange = useCallback(
    (tabKey: string) => {
      setSelectedTab(tabKey);
      if (tabKey !== "complete" && structure) {
        const categoryKey = tabKey;
        const files = structure.categories[categoryKey] || [];
        if (files.length > 0) {
          setSelectedFile(files[0]);
        } else {
          setSelectedFile(null);
        }
      } else {
        setSelectedFile(null);
      }
    },
    [structure]
  );

  if (!structure) {
    return (
      <div className="flex-1 min-w-0 p-4 md:p-7">
        <div className="card-surface fade-in p-8 text-sm text-slate-600">
          {isLoading
            ? "Loading report..."
            : error
              ? `Error: ${error}`
              : "No report data"}
        </div>
      </div>
    );
  }

  // Get available category tabs
  const availableCategories = Object.entries(CATEGORY_MAP).filter(
    ([key]) => structure.categories[key] && structure.categories[key].length > 0
  );

  const categoryFiles =
    selectedTab !== "complete"
      ? structure.categories[selectedTab] || []
      : [];

  return (
    <div className="flex-1 min-w-0 md:h-screen flex flex-col p-3 md:p-5 gap-3 md:gap-4">
      <header className="card-surface fade-in shrink-0 p-4 md:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--primary)]">
              Trading Report
            </p>
            <h2 className="font-heading text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
              {structure.ticker}
            </h2>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => handleTabChange("complete")}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition ${
                selectedTab === "complete"
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "panel-muted text-slate-600 hover:text-[var(--primary-strong)]"
              }`}
            >
              Complete Report
            </button>

            {availableCategories.map(([key, meta]) => (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition ${
                  selectedTab === key
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "panel-muted text-slate-600 hover:text-[var(--primary-strong)]"
                }`}
              >
                {meta.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {selectedTab !== "complete" && categoryFiles.length > 0 && (
        <div className="card-surface fade-in shrink-0 px-3 py-2 md:px-4 md:py-3">
          <div className="flex gap-2 overflow-x-auto">
            {categoryFiles.map((file) => (
              <button
                key={file}
                onClick={() => setSelectedFile(file)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition ${
                  selectedFile === file
                    ? "bg-[var(--primary-soft)] text-[var(--primary-strong)]"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {FILE_LABELS[file] || file}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className="card-surface fade-in flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto p-5 md:p-8">
          {selectedTab === "complete" ? (
            <MarkdownContent content={content} isLoading={isLoading} />
          ) : categoryFiles.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              No data available for this category
            </div>
          ) : (
            <MarkdownContent content={content} isLoading={isLoading} />
          )}
        </div>
      </section>
    </div>
  );
}
