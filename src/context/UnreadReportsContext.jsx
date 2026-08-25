import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { subscribeReports } from "../services/report.service";

const UnreadReportsContext = createContext({
  pendingReportsCount: 0,
  showReportPopup: false,
  reportPopupMessage: "New report",
  clearPendingCount: () => {},
  acknowledgeReport: () => {},
});

function getStoredSeenIds(uid) {
  if (!uid) return new Set();
  try {
    const raw = localStorage.getItem(`agrinet_seen_report_ids_${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch (e) {
    console.warn("Failed to load seen report ids:", e);
  }
  return new Set();
}

function saveStoredSeenIds(uid, seenSet) {
  if (!uid) return;
  try {
    const arr = Array.from(seenSet).slice(-500);
    localStorage.setItem(`agrinet_seen_report_ids_${uid}`, JSON.stringify(arr));
  } catch (e) {
    console.warn("Failed to save seen report ids:", e);
  }
}

function getStoredLastSeenTime(uid) {
  if (!uid) return 0;
  try {
    const raw = localStorage.getItem(`agrinet_last_seen_reports_time_${uid}`);
    return raw ? Number(raw) || 0 : 0;
  } catch (e) {
    console.warn("Failed to load last seen reports time:", e);
  }
  return 0;
}

function saveStoredLastSeenTime(uid, time) {
  if (!uid) return;
  try {
    localStorage.setItem(`agrinet_last_seen_reports_time_${uid}`, String(time));
  } catch (e) {
    console.warn("Failed to save last seen reports time:", e);
  }
}

function getReportMillis(report) {
  if (!report) return 0;
  if (typeof report.createdAt?.toMillis === "function") {
    return report.createdAt.toMillis();
  }
  if (report.createdAt?.seconds) {
    return report.createdAt.seconds * 1000;
  }
  if (report.createdAt instanceof Date) {
    return report.createdAt.getTime();
  }
  return 0;
}

export function UnreadReportsProvider({ children }) {
  const { profile } = useAuth();
  const location = useLocation();
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [reportPopupMessage, setReportPopupMessage] = useState("New report");

  const seenReportsRef = useRef(new Set());
  const lastSeenTimeRef = useRef(0);
  const allReportsRef = useRef([]);
  const popupTimerRef = useRef(null);

  const isReportsPage = location.pathname.includes("/admin/reports");

  // Load persistent seen cache when profile changes
  useEffect(() => {
    if (profile?.uid) {
      seenReportsRef.current = getStoredSeenIds(profile.uid);
      lastSeenTimeRef.current = getStoredLastSeenTime(profile.uid);
    } else {
      seenReportsRef.current = new Set();
      lastSeenTimeRef.current = 0;
    }
  }, [profile?.uid]);

  // When admin visits the reports page, mark all existing reports as read and save to localStorage
  useEffect(() => {
    if (isReportsPage && profile?.uid) {
      const now = Date.now();
      lastSeenTimeRef.current = now;
      saveStoredLastSeenTime(profile.uid, now);

      allReportsRef.current.forEach((r) => seenReportsRef.current.add(r.id));
      saveStoredSeenIds(profile.uid, seenReportsRef.current);

      setPendingReportsCount(0);
      setShowReportPopup(false);
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    }
  }, [isReportsPage, profile?.uid]);

  useEffect(() => {
    if (!profile?.uid || profile?.role !== "admin") {
      setPendingReportsCount(0);
      setShowReportPopup(false);
      return;
    }

    const unsubscribe = subscribeReports(
      (reports) => {
        allReportsRef.current = reports;

        const pendingReports = reports.filter(
          (r) => r.status === "pending" || r.status === "reviewing",
        );

        // If admin is currently on the reports page, acknowledge everything
        if (location.pathname.includes("/admin/reports")) {
          const now = Date.now();
          lastSeenTimeRef.current = now;
          saveStoredLastSeenTime(profile.uid, now);

          pendingReports.forEach((r) => seenReportsRef.current.add(r.id));
          saveStoredSeenIds(profile.uid, seenReportsRef.current);

          setPendingReportsCount(0);
          setShowReportPopup(false);
          return;
        }

        const lastSeenTime = lastSeenTimeRef.current || getStoredLastSeenTime(profile.uid);
        const storedSeenIds = seenReportsRef.current;

        // Filter truly unseen reports:
        // A report is unseen if:
        // 1) Its ID is not in storedSeenIds
        // 2) AND either its createdAt is newer than lastSeenTime OR lastSeenTime is 0 (brand new admin session)
        const unseenReports = pendingReports.filter((r) => {
          if (storedSeenIds.has(r.id)) return false;
          const reportTime = getReportMillis(r);
          if (lastSeenTime > 0 && reportTime > 0 && reportTime <= lastSeenTime) {
            return false;
          }
          return true;
        });

        setPendingReportsCount(unseenReports.length);

        if (unseenReports.length === 0) {
          setShowReportPopup(false);
          if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
          return;
        }

        // Check if there are newly arrived reports that need a popup
        const brandNewReports = unseenReports.filter(
          (r) => !storedSeenIds.has(r.id + "_alerted"),
        );

        if (brandNewReports.length > 0) {
          brandNewReports.forEach((r) => storedSeenIds.add(r.id + "_alerted"));

          setReportPopupMessage("New report");
          setShowReportPopup(true);

          if (popupTimerRef.current) clearTimeout(popupTimerRef.current);

          popupTimerRef.current = setTimeout(() => {
            setShowReportPopup(false);
          }, 5000);
        }
      },
      (err) => {
        console.warn("UnreadReportsProvider error:", err);
      },
    );

    return () => {
      unsubscribe();
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, [profile?.uid, profile?.role, location.pathname]);

  const clearPendingCount = useCallback(() => {
    if (!profile?.uid) return;
    const now = Date.now();
    lastSeenTimeRef.current = now;
    saveStoredLastSeenTime(profile.uid, now);

    allReportsRef.current.forEach((r) => seenReportsRef.current.add(r.id));
    saveStoredSeenIds(profile.uid, seenReportsRef.current);

    setPendingReportsCount(0);
    setShowReportPopup(false);
  }, [profile?.uid]);

  const acknowledgeReport = useCallback((reportId) => {
    if (!profile?.uid) return;
    seenReportsRef.current.add(reportId);
    saveStoredSeenIds(profile.uid, seenReportsRef.current);

    setPendingReportsCount((prev) => Math.max(0, prev - 1));
    setShowReportPopup(false);
  }, [profile?.uid]);

  return (
    <UnreadReportsContext.Provider
      value={{
        pendingReportsCount,
        showReportPopup,
        reportPopupMessage,
        clearPendingCount,
        acknowledgeReport,
      }}
    >
      {children}
    </UnreadReportsContext.Provider>
  );
}

export function useUnreadReports() {
  return useContext(UnreadReportsContext);
}
