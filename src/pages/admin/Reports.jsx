import { useMemo, useState } from "react";

import useReports from "../../hooks/useReports";

import ReportHeader from "../../components/admin/reports/ReportHeader";
import ReportStats from "../../components/admin/reports/ReportStats";
import ReportFilters from "../../components/admin/reports/ReportFilters";
import ReportTable from "../../components/admin/reports/ReportTable";
import ReportDetailsModal from "../../components/admin/reports/ReportDetailsModal";

export default function Reports() {
  const { reports, loading, error, stats } = useReports();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [selectedReport, setSelectedReport] = useState(null);

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !keyword ||
        report.reason?.toLowerCase().includes(keyword) ||
        report.description?.toLowerCase().includes(keyword) ||
        report.reporterName?.toLowerCase().includes(keyword) ||
        report.reporterUsername?.toLowerCase().includes(keyword) ||
        report.reportedUserName?.toLowerCase().includes(keyword);

      const matchesStatus = status === "all" || report.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, status]);

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <ReportHeader />

        <ReportStats stats={stats} />

        <ReportFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
        />

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <i className="ri-error-warning-line text-lg" />

            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <ReportTableSkeleton />
        ) : (
          <ReportTable reports={filteredReports} onView={setSelectedReport} />
        )}
      </div>

      <ReportDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}

function ReportTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="animate-pulse">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-6 border-b border-gray-100 px-5 py-5"
          >
            <div className="flex-1 space-y-2">
              <div className="h-3 w-40 rounded bg-gray-200" />
              <div className="h-2 w-56 rounded bg-gray-100" />
            </div>

            <div className="h-3 w-28 rounded bg-gray-200" />

            <div className="h-3 w-20 rounded bg-gray-200" />

            <div className="h-6 w-20 rounded-full bg-gray-200" />

            <div className="h-8 w-8 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
