import { useCallback, useEffect, useState } from "react";

import DashboardSection from "../../ui/DashboardSection";
import SkeletonBox from "../../ui/SkeletonBox";
import EmptyState from "../../ui/EmptyState";
import Button from "../../ui/Button";
import ConfirmDialog from "../../ui/ConfirmDialog";
import ResponsiveModal from "../../ui/ResponsiveModal";
import UserRow from "./UserRow";

import { useLanguage } from "../../../context/LanguageContext";
import {
  getGroupApplications,
  subscribeToGroupApplications,
  approveApplication,
  rejectApplication,
} from "../../../services/group.service";
import { getUserProfile } from "../../../services/user.service";
import { showToast } from "../../../utils/toast";

export default function GroupApplications({
  groupId,
  onCountsUpdate,
  canApprove = true,
  canReject = true,
}) {
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);

  const loadApplications = useCallback(async () => {
    try {
      const data = await getGroupApplications(groupId);
      const seen = new Set();
      const unique = (data || []).filter((app) => {
        const uId = app?.userId || (app?.id?.includes("_") ? app.id.split("_")[1] : app?.id);
        if (!uId || seen.has(uId)) return false;
        seen.add(uId);
        return true;
      });
      setApplications(unique);
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    setLoading(true);
    loadApplications();

    const unsubscribe = subscribeToGroupApplications(groupId, (data) => {
      const seen = new Set();
      const unique = (data || []).filter((app) => {
        const uId = app?.userId || (app?.id?.includes("_") ? app.id.split("_")[1] : app?.id);
        if (!uId || seen.has(uId)) return false;
        seen.add(uId);
        return true;
      });
      setApplications(unique);
      setLoading(false);
      onCountsUpdate?.();
    });

    return () => unsubscribe();
  }, [groupId, loadApplications, onCountsUpdate]);

  async function handleApprove(userId) {
    try {
      setActionLoading(true);
      await approveApplication(groupId, userId);
      showToast.success(t("adminGroups.applications.approvedSuccess") || "Application approved.");
      if (detailsTarget?.userId === userId) {
        setDetailsTarget(null);
      }
      await loadApplications();
      onCountsUpdate?.();
    } catch (err) {
      showToast.error(err?.message || "Failed to approve.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    try {
      setActionLoading(true);
      await rejectApplication(groupId, rejectTarget.userId);
      showToast.success(t("adminGroups.applications.rejectedSuccess") || "Application rejected.");
      setRejectTarget(null);
      if (detailsTarget?.userId === rejectTarget.userId) {
        setDetailsTarget(null);
      }
      await loadApplications();
      onCountsUpdate?.();
    } catch (err) {
      showToast.error(err?.message || "Failed to reject.");
    } finally {
      setActionLoading(false);
    }
  }

  function formatDateTime(ts) {
    if (!ts) return "";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <>
      <DashboardSection
        title={t("adminGroups.applications.title") || "Pending Applications"}
        icon="ri-file-list-3-line"
        compact
        fill
      >
        {loading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3].map((i) => (
              <SkeletonBox key={i} className="h-16" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            icon="ri-file-list-3-line"
            title={t("adminGroups.applications.noApplications") || "No pending applications"}
            description={
              t("adminGroups.applications.noApplicationsDesc") ||
              "Applications to join this group will appear here."
            }
          />
        ) : (
          <div className="divide-y divide-(--agri-border-subtle)">
            {applications.map((app) => (
              <div
                key={app.id || `${groupId}_${app.userId}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 hover:bg-(--agri-hover)/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <UserRow userId={app.userId} size="sm" />
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1 text-xs">
                  <span className="text-(--agri-text-muted) text-[11px]">
                    <i className="ri-time-line mr-1 text-[11px]" />
                    {formatDateTime(app.appliedAt) || "Recently"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Pending
                  </span>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full sm:w-auto sm:shrink-0 sm:justify-end pt-1 sm:pt-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon="ri-file-user-line"
                    onClick={() => setDetailsTarget(app)}
                    title="View full details of applicant"
                    className="flex-1 sm:flex-none justify-center text-[11px] sm:text-xs px-2 sm:px-3 h-8"
                  >
                    View Details
                  </Button>
                  {canReject && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon="ri-close-line"
                      onClick={() => setRejectTarget(app)}
                      disabled={actionLoading}
                      className="flex-1 sm:flex-none justify-center text-[11px] sm:text-xs px-2 sm:px-3 h-8"
                    >
                      {t("common.reject") || "Reject"}
                    </Button>
                  )}
                  {canApprove && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon="ri-check-line"
                      onClick={() => handleApprove(app.userId)}
                      disabled={actionLoading}
                      loading={actionLoading}
                      className="flex-1 sm:flex-none justify-center text-[11px] sm:text-xs px-2 sm:px-3 h-8"
                    >
                      {t("common.approve") || "Approve"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      {/* View Full Details Modal */}
      <ApplicationDetailsModal
        app={detailsTarget}
        open={Boolean(detailsTarget)}
        onClose={() => setDetailsTarget(null)}
        onApprove={handleApprove}
        onReject={(app) => setRejectTarget(app)}
        canApprove={canApprove}
        canReject={canReject}
        actionLoading={actionLoading}
      />

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        title={t("adminGroups.applications.rejectConfirm") || "Reject Application"}
        description={
          t("adminGroups.applications.rejectConfirmDesc") ||
          "Are you sure you want to reject this membership application?"
        }
        confirmLabel={t("common.reject") || "Reject"}
        danger
        loading={actionLoading}
      />
    </>
  );
}

function ApplicationDetailsModal({
  app,
  open,
  onClose,
  onApprove,
  onReject,
  canApprove,
  canReject,
  actionLoading,
}) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!app?.userId) {
      setProfile(null);
      return;
    }
    let cancelled = false;

    getUserProfile(app.userId)
      .then((p) => {
        if (!cancelled && p) setProfile(p);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [app?.userId]);

  if (!app) return null;

  const displayName =
    profile?.fullname ||
    profile?.displayName ||
    profile?.fullName ||
    app.applicantName ||
    profile?.username ||
    "Applicant";

  const username = profile?.username || app.applicantUsername;
  const email = profile?.email || app.applicantEmail;
  const phone = profile?.phone || profile?.contactNumber || app.applicantPhone;
  const location =
    (typeof profile?.location === "object"
      ? profile.location?.address || profile.location?.city
      : profile?.location) || app.applicantLocation;
  const avatar = profile?.profilePicture || app.applicantAvatar;
  const isVerified =
    profile?.verificationStatus === "approved" ||
    profile?.verified === true ||
    app.applicantVerified;
  const role = profile?.role || app.applicantRole || "Farmer";
  const bio = profile?.bio || app.applicantBio;

  function formatFullDateTime(ts) {
    if (!ts) return "";
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  }

  const appliedDateStr = formatFullDateTime(app.appliedAt);

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      title="Application Details"
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            {canReject && (
              <Button
                variant="danger"
                size="sm"
                icon="ri-close-line"
                disabled={actionLoading}
                onClick={() => {
                  onClose();
                  onReject(app);
                }}
              >
                Reject
              </Button>
            )}
            {canApprove && (
              <Button
                variant="primary"
                size="sm"
                icon="ri-check-line"
                loading={actionLoading}
                disabled={actionLoading}
                onClick={async () => {
                  await onApprove(app.userId);
                  onClose();
                }}
              >
                Approve
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 p-1 sm:p-2">
        {/* Applicant Profile Header Card with Shadow */}
        <div className="flex items-center gap-4 rounded-2xl border border-(--agri-border)/80 bg-(--agri-card) p-4 sm:p-5 shadow-md shadow-black/5 dark:shadow-black/25">
          {avatar ? (
            <img
              src={avatar}
              alt={displayName}
              className="h-14 w-14 lg:h-16 lg:w-16 shrink-0 rounded-2xl object-cover ring-2 ring-(--agri-border)/80 shadow-xs"
            />
          ) : (
            <div className="flex h-14 w-14 lg:h-16 lg:w-16 shrink-0 items-center justify-center rounded-2xl bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-xl font-black text-[#2D6A4F] dark:text-(--agri-brand) shadow-xs ring-1 ring-[#2D6A4F]/20">
              {(displayName || "?")[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg lg:text-xl text-(--agri-text) truncate">
                {displayName}
              </h3>
              {isVerified && (
                <i
                  className="ri-verified-badge-fill text-[#2D6A4F] dark:text-(--agri-brand) text-lg shrink-0"
                  title="Verified User"
                />
              )}
            </div>
            {username && (
              <p className="text-xs sm:text-sm text-(--agri-text-muted)">@{username}</p>
            )}
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 capitalize shadow-2xs">
                <i className="ri-user-star-line text-[11px]" />
                {role}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400 shadow-2xs">
                <i className="ri-time-line text-[11px]" />
                Pending Review
              </span>
            </div>
          </div>
        </div>

        {/* Date & Time Card with Shadow */}
        <div className="rounded-2xl border border-(--agri-border)/80 bg-(--agri-card) p-4 sm:p-5 shadow-md shadow-black/5 dark:shadow-black/25 space-y-1.5">
          <p className="text-[11px] lg:text-xs font-bold uppercase tracking-wider text-(--agri-text-muted) flex items-center gap-1.5">
            <i className="ri-calendar-event-line text-sm lg:text-base text-[#2D6A4F] dark:text-(--agri-brand)" />
            Date and Time of Application
          </p>
          <p className="text-sm sm:text-base font-semibold text-(--agri-text)">
            {appliedDateStr || "Recently applied"}
          </p>
        </div>

        {/* Applicant Details Card with Shadow */}
        <div className="rounded-2xl border border-(--agri-border)/80 bg-(--agri-card) p-4 sm:p-5 shadow-md shadow-black/5 dark:shadow-black/25 space-y-3">
          <p className="text-[11px] lg:text-xs font-bold uppercase tracking-wider text-(--agri-text-muted) flex items-center gap-1.5">
            <i className="ri-profile-line text-sm lg:text-base text-[#2D6A4F] dark:text-(--agri-brand)" />
            Applicant Information
          </p>

          <div className="space-y-2.5 text-xs sm:text-sm">
            {email ? (
              <div className="flex items-center gap-2.5 text-(--agri-text)">
                <i className="ri-mail-line text-base text-(--agri-text-muted) shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="truncate hover:underline text-[#2D6A4F] dark:text-(--agri-brand) font-medium"
                >
                  {email}
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-(--agri-text-muted)">
                <i className="ri-mail-line text-base shrink-0" />
                <span>No email provided</span>
              </div>
            )}

            {phone ? (
              <div className="flex items-center gap-2.5 text-(--agri-text)">
                <i className="ri-phone-line text-base text-(--agri-text-muted) shrink-0" />
                <a
                  href={`tel:${phone}`}
                  className="hover:underline text-[#2D6A4F] dark:text-(--agri-brand) font-medium"
                >
                  {phone}
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-(--agri-text-muted)">
                <i className="ri-phone-line text-base shrink-0" />
                <span>No phone number provided</span>
              </div>
            )}

            {location ? (
              <div className="flex items-start gap-2.5 text-(--agri-text)">
                <i className="ri-map-pin-line text-base text-(--agri-text-muted) shrink-0 mt-0.5" />
                <span className="leading-snug text-(--agri-text-secondary)">{location}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 text-(--agri-text-muted)">
                <i className="ri-map-pin-line text-base shrink-0" />
                <span>No location specified</span>
              </div>
            )}

            {bio && (
              <div className="pt-2.5 border-t border-(--agri-border-subtle)">
                <p className="text-[11px] lg:text-xs font-semibold text-(--agri-text-muted) mb-1">
                  Bio / Notes:
                </p>
                <p className="text-xs sm:text-sm text-(--agri-text-secondary) italic leading-relaxed">
                  "{bio}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
