import { useCallback, useEffect, useMemo, useState } from "react";

import {
  apiListAdminReports,
  apiGetAdminReport,
  updateReportStatus,
} from "../services/report.service";

export default function useAdminReports() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [targetType, setTargetType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiListAdminReports({
        page,
        limit: 20,
        status: status || undefined,
        targetType: targetType || undefined,
        search: search || undefined,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
      });

      setReports(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Failed to load admin reports:", err);
      setError(err?.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [page, status, targetType, search, dateFrom, dateTo]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    setPage(1);
  }, [search, status, targetType, dateFrom, dateTo]);

  const getReport = useCallback(async (reportId) => {
    try {
      return await apiGetAdminReport(reportId);
    } catch (err) {
      console.error("Failed to load report:", err);
      throw err;
    }
  }, []);

  const changeStatus = useCallback(async (reportId, newStatus, adminNotes = "") => {
    if (!reportId) throw new Error("Report ID is required.");

    try {
      setActionLoading(true);
      setActionError(null);

      const result = await updateReportStatus(reportId, newStatus, adminNotes);

      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: result.status, adminNotes: result.adminNotes || r.adminNotes }
            : r,
        ),
      );

      return result;
    } catch (err) {
      console.error("Failed to update report status:", err);
      setActionError(err?.message || "Failed to update report status.");
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  const reviewReport = useCallback(async (reportId) => {
    return changeStatus(reportId, "reviewing");
  }, [changeStatus]);

  const markResolved = useCallback(async (reportId, adminNotes = "") => {
    return changeStatus(reportId, "resolved", adminNotes);
  }, [changeStatus]);

  const markDismissed = useCallback(async (reportId, adminNotes = "") => {
    return changeStatus(reportId, "dismissed", adminNotes);
  }, [changeStatus]);

  const stats = useMemo(() => {
    return {
      total: pagination.total,
    };
  }, [pagination.total]);

  return {
    reports,
    pagination,
    loading,
    error,
    actionLoading,
    actionError,

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

    fetchReports,
    getReport,
    changeStatus,
    reviewReport,
    markResolved,
    markDismissed,
  };
}
