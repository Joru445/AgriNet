import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import useReports from "../../hooks/useReports";
import { setUserSuspension } from "../../services/admin.service";
import { updateProduct } from "../../services/product.service";

import ReportHeader from "../../components/admin/reports/ReportHeader";
import ReportStats from "../../components/admin/reports/ReportStats";
import ReportFilters from "../../components/admin/reports/ReportFilters";
import ReportTable from "../../components/admin/reports/ReportTable";
import ReportDetailsModal from "../../components/admin/reports/ReportDetailsModal";
import { showToast } from "../../utils/toast";

export default function Reports() {
  const { profile } = useAuth();
  const {
    reports,
    loading,
    error,
    stats,
    reviewReport,
    markResolved,
    markDismissed,
  } = useReports({ admin: true });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [selectedReportId, setSelectedReportId] = useState(null);

  const selectedReport = useMemo(() => {
    if (!selectedReportId) return null;
    return reports.find((r) => r.id === selectedReportId) || null;
  }, [reports, selectedReportId]);

  const filteredReports = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !keyword ||
        report.reason?.toLowerCase().includes(keyword) ||
        report.description?.toLowerCase().includes(keyword) ||
        report.reporterName?.toLowerCase().includes(keyword) ||
        report.reporterUsername?.toLowerCase().includes(keyword) ||
        report.reportedUserName?.toLowerCase().includes(keyword) ||
        report.targetTitle?.toLowerCase().includes(keyword);

      const matchesStatus = status === "all" || report.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [reports, search, status]);

  const handleReview = async (reportId) => {
    try {
      await reviewReport(reportId);
      showToast.success("Report marked as reviewing.");
    } catch (err) {
      showToast.error(err?.message || "Failed to update report.");
    }
  };

  const handleResolve = async (reportId, adminNotes = "") => {
    try {
      await markResolved(reportId, profile?.uid || "admin", adminNotes);
      showToast.success("Report resolved and reporter notified.");
    } catch (err) {
      showToast.error(err?.message || "Failed to resolve report.");
    }
  };

  const handleDismiss = async (reportId, adminNotes = "") => {
    try {
      await markDismissed(reportId, profile?.uid || "admin", adminNotes);
      showToast.success("Report dismissed and reporter notified.");
    } catch (err) {
      showToast.error(err?.message || "Failed to dismiss report.");
    }
  };

  const handleToggleUserSuspension = async (uid, nextStatus) => {
    try {
      await setUserSuspension(uid, nextStatus);
      showToast.success(nextStatus === "suspended" ? "User account suspended." : "User account reactivated.");
    } catch (err) {
      showToast.error(err?.message || "Failed to update user account status.");
      throw err;
    }
  };

  const handleToggleProductAvailability = async (productId, nextAvailable) => {
    try {
      await updateProduct(productId, { available: nextAvailable });
      showToast.success(nextAvailable ? "Product listing reactivated." : "Product listing unpublished.");
    } catch (err) {
      showToast.error(err?.message || "Failed to update product listing.");
      throw err;
    }
  };

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
          <ReportTable
            reports={filteredReports}
            onView={(r) => setSelectedReportId(r.id)}
          />
        )}
      </div>

      <ReportDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReportId(null)}
        onReview={handleReview}
        onResolve={handleResolve}
        onDismiss={handleDismiss}
        onToggleUserSuspension={handleToggleUserSuspension}
        onToggleProductAvailability={handleToggleProductAvailability}
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
