"use client";

import { useEffect, useState } from "react";
import { listReports, Report } from "@/lib/api";

interface SidebarProps {
  selectedReportId: string | null;
  onSelectReport: (reportId: string) => void;
}

export function Sidebar({
  selectedReportId,
  onSelectReport,
}: SidebarProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTickers, setExpandedTickers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await listReports();
        setReports(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load reports"
        );
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) =>
    report.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByTicker = filteredReports.reduce(
    (acc, report) => {
      const ticker = report.ticker;
      if (!acc[ticker]) {
        acc[ticker] = [];
      }
      acc[ticker].push(report);
      return acc;
    },
    {} as Record<string, Report[]>
  );

  const sortedTickers = Object.keys(groupedByTicker).sort();

  const toggleTicker = (ticker: string) => {
    const newExpanded = new Set(expandedTickers);
    if (newExpanded.has(ticker)) {
      newExpanded.delete(ticker);
    } else {
      newExpanded.add(ticker);
    }
    setExpandedTickers(newExpanded);
  };

  // Default all tickers as expanded on first load
  useEffect(() => {
    if (!loading && sortedTickers.length > 0 && expandedTickers.size === 0) {
      setExpandedTickers(new Set(sortedTickers));
    }
  }, [loading, sortedTickers]);

  return (
    <div className="w-64 bg-gray-900 text-gray-300 flex flex-col h-screen border-r border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 text-gray-300 placeholder-gray-500 rounded border border-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        )}

        {error && (
          <div className="p-4 text-center text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && filteredReports.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            No reports found
          </div>
        )}

        {!loading && !error && filteredReports.length > 0 && (
           <div className="space-y-4 p-4">
             {sortedTickers.map((ticker) => (
               <div key={ticker}>
                 <button
                   onClick={() => toggleTicker(ticker)}
                   className="w-full text-left flex items-center justify-between px-2 py-1 rounded hover:bg-gray-800 transition-colors"
                 >
                   <div className="text-sm font-semibold text-gray-400">
                     {ticker}
                   </div>
                   <span className={`text-xs text-gray-500 transition-transform ${expandedTickers.has(ticker) ? 'rotate-90' : ''}`}>
                     ▶
                   </span>
                 </button>
                 {expandedTickers.has(ticker) && (
                   <div className="space-y-1">
                     {groupedByTicker[ticker].map((report) => (
                       <button
                         key={report.id}
                         onClick={() => onSelectReport(report.id)}
                         className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                           selectedReportId === report.id
                             ? "bg-orange-600 text-white"
                             : "hover:bg-gray-800 text-gray-300"
                         }`}
                       >
                         <div className="font-medium">{report.date}</div>
                         <div className="text-xs text-gray-400">{report.time}</div>
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             ))}
           </div>
        )}
      </div>
    </div>
  );
}
