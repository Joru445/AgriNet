import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firestore";

const reportsRef = collection(db, "reports");

const REPORT_PAGE_SIZE = 20;

const REPORT_STATUSES = ["pending", "reviewing", "resolved", "dismissed"];

/*
 * ============================================================
 * CREATE REPORT
 * ============================================================
 *
 * A report belongs to the user who submitted it.
 *
 * The Firestore rules also enforce reporterId === auth.uid.
 */

export async function createReport({
  reporterId,
  reporterName = "",
  reporterUsername = "",
  reporterEmail = "",
  reporterRole = "",

  reportedUserId,
  reportedUserName = "",
  reportedUserUsername = "",
  reportedUserRole = "",
  reportedUserEmail = "",

  targetType = "user",
  targetId = null,
  targetTitle = "",

  reason,
  description = "",
}) {
  if (!reporterId) {
    throw new Error("Reporter UID is required.");
  }

  if (!reportedUserId) {
    throw new Error("Reported user UID is required.");
  }

  if (!reason?.trim()) {
    throw new Error("Report reason is required.");
  }

  if (reporterId === reportedUserId) {
    throw new Error("You cannot report yourself.");
  }

  const reportData = {
    reporterId,
    reporterName: reporterName || null,
    reporterUsername: reporterUsername || null,
    reporterEmail: reporterEmail || null,
    reporterRole: reporterRole || null,

    reportedUserId,
    reportedUserName: reportedUserName || null,
    reportedUserUsername: reportedUserUsername || null,
    reportedUserRole: reportedUserRole || null,
    reportedUserEmail: reportedUserEmail || null,

    targetType: targetType || "user",
    targetId: targetId || null,
    targetTitle: targetTitle || null,

    reason: reason.trim(),
    description: description.trim(),

    status: "pending",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    resolvedAt: null,
    resolvedBy: null,
  };

  const reportRef = await addDoc(reportsRef, reportData);

  return {
    id: reportRef.id,
    ...reportData,
  };
}

/*
 * ============================================================
 * GET REPORT
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
 * GET USER REPORTS
 * ============================================================
 *
 * Gets reports submitted by a specific user.
 *
 * Firestore rules only allow the authenticated user to read
 * their own reports unless they are an admin.
 */

export async function getUserReports(reporterId) {
  if (!reporterId) {
    throw new Error("Reporter UID is required.");
  }

  const reportsQuery = query(
    reportsRef,
    where("reporterId", "==", reporterId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(reportsQuery);

  return snapshot.docs.map((reportDoc) => ({
    id: reportDoc.id,
    ...reportDoc.data(),
  }));
}

/*
 * ============================================================
 * SUBSCRIBE TO USER REPORTS
 * ============================================================
 */

export function subscribeUserReports(reporterId, callback, onError) {
  if (!reporterId || !callback) {
    return () => {};
  }

  const reportsQuery = query(
    reportsRef,
    where("reporterId", "==", reporterId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    reportsQuery,
    (snapshot) => {
      const reports = snapshot.docs.map((reportDoc) => ({
        id: reportDoc.id,
        ...reportDoc.data(),
      }));

      callback(reports);
    },
    (error) => {
      console.error("Failed to subscribe to user reports:", error);

      onError?.(error);
    },
  );
}

/*
 * ============================================================
 * SUBSCRIBE TO ALL REPORTS
 * ============================================================
 *
 * Intended for the admin reports page.
 */

export function subscribeReports(callback, onError) {
  if (!callback) {
    return () => {};
  }

  const reportsQuery = query(
    reportsRef,
    orderBy("createdAt", "desc"),
    limit(REPORT_PAGE_SIZE),
  );

  return onSnapshot(
    reportsQuery,
    (snapshot) => {
      const reports = snapshot.docs.map((reportDoc) => ({
        id: reportDoc.id,
        ...reportDoc.data(),
      }));

      callback(reports);
    },
    (error) => {
      console.error("Failed to subscribe to reports:", error);

      onError?.(error);
    },
  );
}

/*
 * ============================================================
 * GET REPORTS BY STATUS
 * ============================================================
 *
 * Useful for the admin filters.
 */

export async function getReportsByStatus(status) {
  if (!REPORT_STATUSES.includes(status)) {
    throw new Error("Invalid report status.");
  }

  const reportsQuery = query(
    reportsRef,
    where("status", "==", status),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(reportsQuery);

  return snapshot.docs.map((reportDoc) => ({
    id: reportDoc.id,
    ...reportDoc.data(),
  }));
}

/*
 * ============================================================
 * UPDATE REPORT STATUS
 * ============================================================
 *
 * Admin-only operation.
 *
 * The Firestore rules are responsible for actually enforcing
 * that only admins can update reports.
 */

export async function updateReportStatus(reportId, status, adminUid) {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  if (!REPORT_STATUSES.includes(status)) {
    throw new Error("Invalid report status.");
  }

  if (!adminUid) {
    throw new Error("Admin UID is required.");
  }

  const reportRef = doc(db, "reports", reportId);

  const updateData = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (status === "resolved" || status === "dismissed") {
    updateData.resolvedAt = serverTimestamp();
    updateData.resolvedBy = adminUid;
  } else {
    updateData.resolvedAt = null;
    updateData.resolvedBy = null;
  }

  await updateDoc(reportRef, updateData);
}

/*
 * ============================================================
 * START REVIEW
 * ============================================================
 */

export async function startReportReview(reportId) {
  if (!reportId) {
    throw new Error("Report ID is required.");
  }

  await updateDoc(doc(db, "reports", reportId), {
    status: "reviewing",
    updatedAt: serverTimestamp(),
  });
}

/*
 * ============================================================
 * RESOLVE REPORT
 * ============================================================
 */

export async function resolveReport(reportId, adminUid) {
  return updateReportStatus(reportId, "resolved", adminUid);
}

/*
 * ============================================================
 * DISMISS REPORT
 * ============================================================
 */

export async function dismissReport(reportId, adminUid) {
  return updateReportStatus(reportId, "dismissed", adminUid);
}
