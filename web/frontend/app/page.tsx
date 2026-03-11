"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ReportViewer } from "@/components/ReportViewer";

export default function Home() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar
        selectedReportId={selectedReportId}
        onSelectReport={setSelectedReportId}
      />

      {selectedReportId ? (
        <ReportViewer reportId={selectedReportId} />
      ) : (
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <h1 className="text-3xl font-bold text-gray-100 mb-4">
              Select a Report
            </h1>
            <p className="text-gray-400 text-lg">
              Choose a report from the sidebar to view its analysis and insights.
            </p>
          </div>
        </main>
      )}
    </div>
  );
}
