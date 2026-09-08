import { useCallback, useState } from "react";

import useAdminReports from "../../hooks/useAdminReports";
import { apiSetUserSuspension, apiSetProductAvailability } from "../../services/admin.service";

import ReportHeader from "../../components/admin/reports/ReportHeader";
import ReportStats from "../../components/admin/reports/ReportStats";
import ReportFilters from "../../components/admin/reports/ReportFilters";
import ReportTable from "../../components/admin/reports/ReportTable";
import ReportTableSkeleton from "../../components/admin/reports/ReportTableSkeleton";
import ReportDetailsModal from "../../components/admin/reports/ReportDetailsModal";
import { InlineError } from "../../components/ui/ErrorState";
import { showToast } from "../../utils/toast";
import { useLanguage } from "../../context/LanguageContext";

export default function Reports() {
  const { t } = useLanguage();
  const {
    reports,
    pagination,
    loading,
    error,
    search,
    setSearch,
    status,
    setStatus,
    targetType,
    setTargetType,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
    stats,
    getReport,
    reviewReport,
    markResolved,
    markDismissed,
  } = useAdminReports();

  const [selectedReport, setSelectedReport] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleViewReport = useCallback(async (report) => {
    setDetailLoading(true);
    try {
      const enriched = await getReport(report.id);
      setSelectedReport(enriched);
    } catch {
      setSelectedReport(report);
    } finally {
      setDetailLoading(false);
    }
  }, [getReport]);

  const handleReview = useCallback(async (reportId) => {
    try {
      await reviewReport(reportId);
      setSelectedReport((prev) => (prev && prev.id === reportId ? { ...prev, status: "reviewing" } : prev));
      showToast.success(t("adminReport.toastReviewing"));
    } catch (err) {
      showToast.error(err?.message || t("adminReport.toastFailedUpdate"));
    }
  }, [reviewReport, t]);

  const handleResolve = useCallback(async (reportId, adminNotes = "") => {
    try {
      await markResolved(reportId, adminNotes);
      setSelectedReport((prev) => (prev && prev.id === reportId ? { ...prev, status: "resolved", adminNotes } : prev));
      showToast.success(t("adminReport.toastResolved"));
    } catch (err) {
      showToast.error(err?.message || t("adminReport.toastFailedResolve"));
    }
  }, [markResolved, t]);

  const handleDismiss = useCallback(async (reportId, adminNotes = "") => {
    try {
      await markDismissed(reportId, adminNotes);
      setSelectedReport((prev) => (prev && prev.id === reportId ? { ...prev, status: "dismissed", adminNotes } : prev));
      showToast.success(t("adminReport.toastDismissed"));
    } catch (err) {
      showToast.error(err?.message || t("adminReport.toastFailedDismiss"));
    }
  }, [markDismissed, t]);

  const handleToggleUserSuspension = useCallback(async (uid, nextStatus) => {
    try {
      await apiSetUserSuspension(uid, nextStatus);
      setSelectedReport((prev) => {
        if (!prev || !prev.reportedUser) return prev;
        if (prev.reportedUser.uid === uid) {
          return { ...prev, reportedUser: { ...prev.reportedUser, status: nextStatus } };
        }
        return prev;
      });
      showToast.success(nextStatus === "suspended" ? t("adminReport.toastUserSuspended") : t("adminReport.toastUserReactivated"));
    } catch (err) {
      showToast.error(err?.message || t("adminReport.toastFailedUserStatus"));
      throw err;
    }
  }, [t]);

  const handleToggleProductAvailability = useCallback(async (productId, nextAvailable) => {
    try {
      await apiSetProductAvailability(productId, nextAvailable);
      setSelectedReport((prev) => {
        if (!prev || !prev.targetProduct) return prev;
        if (prev.targetProduct.id === productId) {
          return { ...prev, targetProduct: { ...prev.targetProduct, available: nextAvailable } };
        }
        return prev;
      });
      showToast.success(nextAvailable ? t("adminReport.toastProductReactivated") : t("adminReport.toastProductUnpublished"));
    } catch (err) {
      showToast.error(err?.message || t("adminReport.toastFailedProduct"));
      throw err;
    }
  }, [t]);

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <ReportHeader />

        <ReportStats stats={stats} />

        <ReportFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          targetType={targetType}
          onTargetTypeChange={setTargetType}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />

        {error && <InlineError message={error} />}

        {loading ? (
          <ReportTableSkeleton />
        ) : (
          <ReportTable
            reports={reports}
            pagination={pagination}
            page={page}
            onPageChange={setPage}
            onView={handleViewReport}
          />
        )}
      </div>

      {detailLoading && !selectedReport && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="rounded-2xl bg-[var(--agri-card)] p-8 shadow-2xl border border-[var(--agri-border-subtle)]">
            <div className="flex items-center gap-3">
              <i className="ri-loader-4-line animate-spin text-xl text-[var(--agri-brand)]" />
              <span className="text-sm font-bold text-[var(--agri-text)]">{t("adminReport.loadingDetails")}</span>
            </div>
          </div>
        </div>
      )}

      <ReportDetailsModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onReview={handleReview}
        onResolve={handleResolve}
        onDismiss={handleDismiss}
        onToggleUserSuspension={handleToggleUserSuspension}
        onToggleProductAvailability={handleToggleProductAvailability}
      />
    </div>
  );
}
