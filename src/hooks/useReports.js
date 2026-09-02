import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  subscribeReports,
  subscribeUserReports,
  createReport,
  getReport,
  updateReportStatus,
  startReportReview,
  resolveReport,
  dismissReport,
} from "../services/report.service";

const REPORT_STATUSES = ["pending", "reviewing", "resolved", "dismissed"];

export default function useReports({ userId = null, admin = false } = {}) {
  const { profile } = useAuth();
  const isAdmin = admin || profile?.role === "admin";
  const effectiveUserId = userId || profile?.uid;

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  /*
   * ============================================================
   * SUBSCRIBE REPORTS
   * ============================================================
   *
   * Admin:
   *   Subscribe to all reports.
   *
   * Normal user:
   *   Subscribe only to their own reports.
   */

  useEffect(() => {
    if (!effectiveUserId && !isAdmin) {
      setReports([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let unsubscribe;

    if (isAdmin) {
      unsubscribe = subscribeReports(
        (data) => {
          setReports(data);
          setLoading(false);
        },
        (err) => {
          console.error("Failed to load reports:", err);

          setError(err?.message || "Failed to load reports.");

          setLoading(false);
        },
      );
    } else {
      unsubscribe = subscribeUserReports(
        effectiveUserId,
        (data) => {
          setReports(data);
          setLoading(false);
        },
        (err) => {
          console.error("Failed to load user reports:", err);

          setError(err?.message || "Failed to load reports.");

          setLoading(false);
        },
      );
    }

    return () => {
      unsubscribe?.();
    };
  }, [effectiveUserId, isAdmin]);

  /*
   * ============================================================
   * GET REPORT
   * ============================================================
   */

  const findReport = useCallback(async (reportId) => {
    if (!reportId) {
      throw new Error("Report ID is required.");
    }

    return getReport(reportId);
  }, []);

  /*
   * ============================================================
   * CREATE REPORT
   * ============================================================
   */

  const submitReport = useCallback(
    async (data) => {
      try {
        setActionLoading(true);
        setActionError(null);

        const report = await createReport({
          reporterId: userId,
          ...data,
        });

        return report;
      } catch (err) {
        console.error("Failed to create report:", err);

        setActionError(err?.message || "Failed to submit report.");

        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [userId],
  );

  /*
   * ============================================================
   * UPDATE STATUS
   * ============================================================
   */

  const changeStatus = useCallback(async (reportId, status, adminUid) => {
    if (!reportId) {
      throw new Error("Report ID is required.");
    }

    if (!REPORT_STATUSES.includes(status)) {
      throw new Error("Invalid report status.");
    }

    if (!adminUid) {
      throw new Error("Admin UID is required.");
    }

    try {
      setActionLoading(true);
      setActionError(null);

      return await updateReportStatus(reportId, status, adminUid);
    } catch (err) {
      console.error("Failed to update report status:", err);

      setActionError(err?.message || "Failed to update report status.");

      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  /*
   * ============================================================
   * START REVIEW
   * ============================================================
   */

  const reviewReport = useCallback(async (reportId) => {
    if (!reportId) {
      throw new Error("Report ID is required.");
    }

    try {
      setActionLoading(true);
      setActionError(null);

      return await startReportReview(reportId);
    } catch (err) {
      console.error("Failed to start report review:", err);

      setActionError(err?.message || "Failed to start report review.");

      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  /*
   * ============================================================
   * RESOLVE REPORT
   * ============================================================
   */

  const markResolved = useCallback(async (reportId, adminUid, adminNotes = "") => {
    if (!reportId) {
      throw new Error("Report ID is required.");
    }

    if (!adminUid) {
      throw new Error("Admin UID is required.");
    }

    try {
      setActionLoading(true);
      setActionError(null);

      return await resolveReport(reportId, adminUid, adminNotes);
    } catch (err) {
      console.error("Failed to resolve report:", err);

      setActionError(err?.message || "Failed to resolve report.");

      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  /*
   * ============================================================
   * DISMISS REPORT
   * ============================================================
   */

  const markDismissed = useCallback(async (reportId, adminUid, adminNotes = "") => {
    if (!reportId) {
      throw new Error("Report ID is required.");
    }

    if (!adminUid) {
      throw new Error("Admin UID is required.");
    }

    try {
      setActionLoading(true);
      setActionError(null);

      return await dismissReport(reportId, adminUid, adminNotes);
    } catch (err) {
      console.error("Failed to dismiss report:", err);

      setActionError(err?.message || "Failed to dismiss report.");

      throw err;
    } finally {
      setActionLoading(false);
    }
  }, []);

  /*
   * ============================================================
   * REPORT STATISTICS
   * ============================================================
   */

  const stats = useMemo(() => {
    const pending = reports.filter(
      (report) => report.status === "pending",
    ).length;

    const reviewing = reports.filter(
      (report) => report.status === "reviewing",
    ).length;

    const resolved = reports.filter(
      (report) => report.status === "resolved",
    ).length;

    const dismissed = reports.filter(
      (report) => report.status === "dismissed",
    ).length;

    return {
      total: reports.length,
      pending,
      reviewing,
      resolved,
      dismissed,
    };
  }, [reports]);

  /*
   * ============================================================
   * FILTER REPORTS
   * ============================================================
   */

  const getReportsByStatus = useCallback(
    (status) => {
      if (!status || status === "all") {
        return reports;
      }

      if (!REPORT_STATUSES.includes(status)) {
        return [];
      }

      return reports.filter((report) => report.status === status);
    },
    [reports],
  );

  /*
   * ============================================================
   * CLEAR ACTION ERROR
   * ============================================================
   */

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  /*
   * ============================================================
   * RETURN
   * ============================================================
   */

  return {
    reports,

    loading,
    error,

    actionLoading,
    actionError,

    stats,

    findReport,
    submitReport,

    changeStatus,
    reviewReport,
    markResolved,
    markDismissed,

    getReportsByStatus,

    clearActionError,
  };
}
