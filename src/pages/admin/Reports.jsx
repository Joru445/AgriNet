import { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import useReports from "../../hooks/useReports";
import { setUserSuspension } from "../../services/admin.service";
import { updateProduct } from "../../services/product.service";

import ReportHeader from "../../components/admin/reports/ReportHeader";
import ReportStats from "../../components/admin/reports/ReportStats";
import ReportFilters from "../../components/admin/reports/ReportFilters";
import ReportTable from "../../components/admin/reports/ReportTable";
import ReportTableSkeleton from "../../components/admin/reports/ReportTableSkeleton";
import ReportDetailsModal from "../../components/admin/reports/ReportDetailsModal";
import { InlineError } from "../../components/ui/ErrorState";
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

        {error && <InlineError message={error} />}

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
