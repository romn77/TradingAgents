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
      <div className="p-8">
        <div className="text-gray-400">
          {isLoading ? "Loading report..." : error ? `Error: ${error}` : "No report data"}
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
    <div className="flex-1 flex flex-col h-screen bg-gray-900 text-gray-100">
      {/* Header with ticker and main tabs */}
      <div className="border-b border-gray-700 bg-gray-800 p-4">
        <h2 className="text-2xl font-bold mb-4">{structure.ticker}</h2>

        {/* Main tab navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => handleTabChange("complete")}
            className={`px-4 py-2 rounded font-medium whitespace-nowrap transition ${
              selectedTab === "complete"
                ? "bg-orange-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Complete Report
          </button>

          {availableCategories.map(([key, meta]) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`px-4 py-2 rounded font-medium whitespace-nowrap transition ${
                selectedTab === key
                  ? "bg-orange-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tabs for category files */}
      {selectedTab !== "complete" && categoryFiles.length > 0 && (
        <div className="border-b border-gray-700 bg-gray-750 px-4 py-2 flex gap-2 overflow-x-auto">
          {categoryFiles.map((file) => (
            <button
              key={file}
              onClick={() => setSelectedFile(file)}
              className={`px-3 py-2 rounded text-sm whitespace-nowrap transition ${
                selectedFile === file
                  ? "bg-gray-600 text-orange-400"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {FILE_LABELS[file] || file}
            </button>
          ))}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-8">
        {selectedTab === "complete" ? (
          <MarkdownContent content={content} isLoading={isLoading} />
        ) : categoryFiles.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No data available for this category
          </div>
        ) : (
          <MarkdownContent content={content} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
