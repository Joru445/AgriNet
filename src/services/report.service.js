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
import { createNotification } from "./notification.service";

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
 * GET ACTIVE REPORT FOR TARGET
 * ============================================================
 *
 * Checks if the user already has an unresolved (pending or reviewing)
 * report for this specific target or user.
 */

export async function getActiveReportForTarget({
  reporterId,
  targetId = null,
  reportedUserId = null,
  targetType = "user",
}) {
  if (!reporterId) return null;

  try {
    const q = query(
      reportsRef,
      where("reporterId", "==", reporterId),
    );
    const snapshot = await getDocs(q);

    const activeReports = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((r) => r.status === "pending" || r.status === "reviewing");

    // Match by targetId or reportedUserId
    const match = activeReports.find((r) => {
      if (targetId && r.targetId === targetId) return true;
      if (reportedUserId && r.reportedUserId === reportedUserId) {
        if (targetType === "user" || targetType === "profile" || r.targetType === "user" || r.targetType === "profile") {
          return true;
        }
      }
      return false;
    });

    return match || null;
  } catch (err) {
    console.error("Failed to check existing active report:", err);
    return null;
  }
}

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
  evidenceUrl = null,
  evidencePublicId = null,
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

  // Check 24-hour rate limit (max 5 reports in 24 hours per user)
  try {
    const userReportsSnap = await getDocs(
      query(reportsRef, where("reporterId", "==", reporterId)),
    );
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const reportsIn24h = userReportsSnap.docs.filter((d) => {
      const data = d.data();
      const time = data.createdAt?.toMillis?.() || (data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0);
      return now - time < ONE_DAY_MS;
    });

    if (reportsIn24h.length >= 5) {
      throw new Error("You have reached the limit of 5 reports in a 24-hour period. Please try again later.");
    }
  } catch (err) {
    if (err?.message?.includes("limit of 5 reports")) {
      throw err;
    }
  }

  // Prevent duplicate report until previous one is resolved
  const existingActiveReport = await getActiveReportForTarget({
    reporterId,
    targetId: targetId || reportedUserId,
    reportedUserId,
    targetType,
  });

  if (existingActiveReport) {
    throw new Error(
      "You have already submitted a report for this item. Our moderation team is currently reviewing it and will contact you if needed.",
    );
  }

  const priority = getReportPriority(reason);

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
    priority,

    evidenceUrl: evidenceUrl || null,
    evidencePublicId: evidencePublicId || null,

    status: "pending",
    adminNotes: null,

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
      console.warn("Retrying subscribeUserReports fallback:", error);
      const fallbackQuery = query(
        reportsRef,
        where("reporterId", "==", reporterId),
      );
      return onSnapshot(
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
}

/*
 * ============================================================
 * SUBSCRIBE TO ALL REPORTS
 * ============================================================
 *
 * Intended for the admin reports page.
 */

export function subscribeReports(callback, onError, maxLimit = 100) {
  if (!callback) {
    return () => {};
  }

  const reportsQuery = query(
    reportsRef,
    orderBy("createdAt", "desc"),
    limit(maxLimit),
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
      console.warn("Retrying subscribeReports fallback:", error);
      const fallbackQuery = query(reportsRef, limit(maxLimit));
      return onSnapshot(
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

export async function updateReportStatus(reportId, status, adminUid, adminNotes = "") {
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
  const reportSnap = await getDoc(reportRef);
  const existingData = reportSnap.exists() ? reportSnap.data() : null;

  const updateData = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (adminNotes && typeof adminNotes === "string") {
    updateData.adminNotes = adminNotes.trim();
  }

  if (status === "resolved" || status === "dismissed") {
    updateData.resolvedAt = serverTimestamp();
    updateData.resolvedBy = adminUid;
  } else {
    updateData.resolvedAt = null;
    updateData.resolvedBy = null;
  }

  await updateDoc(reportRef, updateData);

  // Send resolution notification to the reporter
  if (existingData?.reporterId && (status === "resolved" || status === "dismissed")) {
    const isResolved = status === "resolved";
    const targetName = existingData.targetTitle || "your reported item";
    const noteText = adminNotes?.trim() ? ` Note: "${adminNotes.trim()}"` : "";

    createNotification({
      recipientId: existingData.reporterId,
      type: "system",
      title: isResolved ? "Report Resolved" : "Report Update",
      body: isResolved
        ? `Your report regarding "${targetName}" has been reviewed and resolved by our moderation team.${noteText} Thank you for helping keep AgriNet safe!`
        : `Your report regarding "${targetName}" has been reviewed and closed by our moderation team.${noteText}`,
      actorId: adminUid,
      entityType: "report",
      entityId: reportId,
      data: {
        reportId,
        status,
        adminNotes: adminNotes || "",
      },
    }).catch((err) => {
      console.warn("Could not dispatch report notification to reporter:", err);
    });
  }
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

export async function resolveReport(reportId, adminUid, adminNotes = "") {
  return updateReportStatus(reportId, "resolved", adminUid, adminNotes);
}

/*
 * ============================================================
 * DISMISS REPORT
 * ============================================================
 */

export async function dismissReport(reportId, adminUid, adminNotes = "") {
  return updateReportStatus(reportId, "dismissed", adminUid, adminNotes);
}
