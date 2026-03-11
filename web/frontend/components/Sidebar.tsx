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
  }, [loading, sortedTickers, expandedTickers.size]);

  return (
    <aside className="w-full md:w-[18rem] md:h-screen shrink-0 border-b md:border-b-0 md:border-r border-[var(--border)] bg-white/88 backdrop-blur">
      <div className="border-b border-[var(--border)] px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-7 place-items-center rounded-md bg-[var(--primary)] text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
              <path
                d="M4 16l4.2-4.2L11 14.6l8-8"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-heading text-sm font-bold tracking-tight text-slate-900">
            QUANT<span className="text-[var(--primary)]">CORE</span>
          </p>
        </div>

        <div className="relative mt-3">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            fill="none"
            aria-hidden
          >
            <path
              d="M11 5a6 6 0 104.24 10.24L19 19"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-quiet)] py-2 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[color:rgba(236,91,19,0.2)]"
          />
        </div>
      </div>

      <div className="max-h-[48vh] overflow-y-auto md:max-h-[calc(100vh-140px)]">
        {loading && (
          <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
        )}

        {error && (
          <div className="p-4 text-center text-sm text-rose-600">{error}</div>
        )}

        {!loading && !error && filteredReports.length === 0 && (
          <div className="p-4 text-center text-sm text-slate-500">
            No reports found
          </div>
        )}

        {!loading && !error && filteredReports.length > 0 && (
          <div className="space-y-4 px-3 py-4">
            <div className="px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
              Reports
            </div>
            {sortedTickers.map((ticker) => (
              <div key={ticker} className="space-y-1.5">
                <button
                  onClick={() => toggleTicker(ticker)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left transition-colors hover:bg-slate-100"
                >
                  <div className="text-sm font-semibold text-slate-600">
                    {ticker}
                  </div>
                  <span
                    className={`text-xs text-slate-400 transition-transform ${
                      expandedTickers.has(ticker) ? "rotate-90" : ""
                    }`}
                    aria-hidden
                  >
                    &gt;
                  </span>
                </button>
                {expandedTickers.has(ticker) && (
                  <div className="space-y-1 border-l border-[var(--border)] pl-2">
                    {groupedByTicker[ticker].map((report) => (
                      <button
                        key={report.id}
                        onClick={() => onSelectReport(report.id)}
                        className={`w-full rounded-r-lg px-2.5 py-2 text-left text-sm transition-all ${
                          selectedReportId === report.id
                            ? "bg-[var(--primary-soft)] text-[var(--primary-strong)] shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="font-medium">{report.date}</div>
                        <div className="mt-0.5 text-xs text-slate-400">{report.time}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
