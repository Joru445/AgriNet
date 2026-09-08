import {
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";
import { apiRequest } from "./api/api.client";

const reportsRef = collection(db, "reports");

const REPORT_STATUSES = ["pending", "reviewing", "resolved", "dismissed"];

/**
 * Calculates urgency priority from report reason.
 */
export function getReportPriority(reason = "") {
  const r = reason.toLowerCase();
  if (r.includes("human trafficking") || r.includes("exploitation") || r.includes("scam") || r.includes("fraud")) {
    return "critical";
  }
  if (r.includes("bullying") || r.includes("harassment") || r.includes("prohibited") || r.includes("fake")) {
    return "high";
  }
  if (r.includes("inappropriate") || r.includes("spam") || r.includes("impersonation")) {
    return "medium";
  }
  return "low";
}

/*
 * ============================================================
 * CREATE REPORT (via backend API)
 * ============================================================
 */

export async function createReport(data) {
  const result = await apiRequest("/admin/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return result.data;
}

/*
 * ============================================================
 * GET ACTIVE REPORT FOR TARGET (via backend API)
 * ============================================================
 */

export async function getActiveReportForTarget({
  reporterId,
  targetId = null,
  reportedUserId = null,
  targetType = "user",
}) {
  if (!reporterId) return null;

  try {
    const result = await apiRequest("/admin/reports/mine?limit=100");
    const reports = result.data || [];

    const match = reports.find((r) => {
      if (r.status !== "pending" && r.status !== "reviewing") return false;
      if (targetId && r.targetId === targetId) return true;
      if (reportedUserId && r.reportedUserId === reportedUserId) {
        if (targetType === "user" || targetType === "profile" || r.targetType === "user" || r.targetType === "profile") {
          return true;
        }
      }
      return false;
    });

    return match || null;
  } catch {
    return null;
  }
}

/*
 * ============================================================
 * GET REPORT (direct Firestore read)
 * ============================================================
 */

export async function getReport(reportId) {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  const snapshot = await getDoc(doc(db, "reports", reportId));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/*
 * ============================================================
 * UPDATE REPORT STATUS (BACKEND)
 * ============================================================
 */

export async function updateReportStatus(reportId, status, adminNotes = "") {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  if (!REPORT_STATUSES.includes(status)) {
    throw new Error("Invalid report status.");
  }

  const result = await apiRequest(`/admin/reports/${reportId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminNotes }),
  });

  return result.report;
}

export async function startReportReview(reportId) {
  return updateReportStatus(reportId, "reviewing");
}

export async function resolveReport(reportId, adminNotes = "") {
  return updateReportStatus(reportId, "resolved", adminNotes);
}

export async function dismissReport(reportId, adminNotes = "") {
  return updateReportStatus(reportId, "dismissed", adminNotes);
}

/*
 * ============================================================
 * ADMIN — LIST REPORTS (server-side filtered)
 * ============================================================
 */

export async function apiListAdminReports({
  page = 1,
  limit = 20,
  status = null,
  targetType = null,
  search = null,
  startDate = null,
  endDate = null,
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (status && status !== "all") params.set("status", status);
  if (targetType && targetType !== "all") params.set("targetType", targetType);
  if (search) params.set("search", search);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  const result = await apiRequest(`/admin/reports?${params.toString()}`);
  return result;
}

/*
 * ============================================================
 * ADMIN — GET REPORT BY ID (enriched with target data)
 * ============================================================
 */

export async function apiGetAdminReport(reportId) {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  const result = await apiRequest(`/admin/reports/${reportId}`);
  return result.data;
}

/*
 * ============================================================
 * REALTIME LISTENERS (intentional Firebase)
 * ============================================================
 *
 * These stay on direct Firestore for live updates.
 */

export function subscribeUserReports(reporterId, callback, onError) {
  if (!reporterId || !callback) {
    return () => {};
  }

  let primaryUnsub = null;
  let fallbackUnsub = null;
  let fallbackActive = false;

  const reportsQuery = query(
    reportsRef,
    where("reporterId", "==", reporterId),
    orderBy("createdAt", "desc"),
    limit(100),
  );

  primaryUnsub = onSnapshot(
    reportsQuery,
    (snapshot) => {
      const reports = snapshot.docs.map((reportDoc) => ({
        id: reportDoc.id,
        ...reportDoc.data(),
      }));

      callback(reports);
    },
    (error) => {
      console.warn("subscribeUserReports: primary failed, trying fallback:", error);
      primaryUnsub?.();
      primaryUnsub = null;
      fallbackActive = true;

      const fallbackQuery = query(
        reportsRef,
        where("reporterId", "==", reporterId),
        limit(100),
      );

      fallbackUnsub = onSnapshot(
        fallbackQuery,
        (snapshot) => {
          const reports = snapshot.docs.map((reportDoc) => ({
            id: reportDoc.id,
            ...reportDoc.data(),
          }));
          reports.sort((a, b) => {
            const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
          callback(reports);
        },
        onError,
      );
    },
  );

  return () => {
    if (fallbackActive) {
      fallbackUnsub?.();
    } else {
      primaryUnsub?.();
    }
  };
}

export function subscribeReports(callback, onError, maxLimit = 100) {
  if (!callback) {
    return () => {};
  }

  let primaryUnsub = null;
  let fallbackUnsub = null;
  let fallbackActive = false;

  const reportsQuery = query(
    reportsRef,
    orderBy("createdAt", "desc"),
    limit(maxLimit),
  );

  primaryUnsub = onSnapshot(
    reportsQuery,
    (snapshot) => {
      const reports = snapshot.docs.map((reportDoc) => ({
        id: reportDoc.id,
        ...reportDoc.data(),
      }));

      callback(reports);
    },
    (error) => {
      console.warn("subscribeReports: primary failed, trying fallback:", error);
      primaryUnsub?.();
      primaryUnsub = null;
      fallbackActive = true;

      const fallbackQuery = query(reportsRef, limit(maxLimit));

      fallbackUnsub = onSnapshot(
        fallbackQuery,
        (snapshot) => {
          const reports = snapshot.docs.map((reportDoc) => ({
            id: reportDoc.id,
            ...reportDoc.data(),
          }));
          reports.sort((a, b) => {
            const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
            return timeB - timeA;
          });
          callback(reports);
        },
        onError,
      );
    },
  );

  return () => {
    if (fallbackActive) {
      fallbackUnsub?.();
    } else {
      primaryUnsub?.();
    }
  };
}
