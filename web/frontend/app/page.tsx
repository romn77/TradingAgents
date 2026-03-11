"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ReportViewer } from "@/components/ReportViewer";

export default function Home() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar
        selectedReportId={selectedReportId}
        onSelectReport={setSelectedReportId}
      />

      {selectedReportId ? (
        <ReportViewer reportId={selectedReportId} />
      ) : (
        <main className="flex-1 min-w-0 p-4 md:p-7">
          <div className="card-surface fade-in mx-auto mt-4 max-w-2xl p-8 md:p-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
              TradingAgents Report Center
            </p>
            <h1 className="font-heading mt-3 text-3xl md:text-4xl font-bold text-slate-900">
              Select a report to start analysis review
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">
              Use the left panel to search by ticker and date. Once selected,
              you will get stage-by-stage tabs and a fully formatted markdown
              report.
            </p>
          </div>
        </main>
      )}
    </div>
  );
}
