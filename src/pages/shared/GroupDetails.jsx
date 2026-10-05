import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  getGroup,
  getMyMembership,
  subscribeToMyMembership,
  subscribeToGroupMembers,
  getGroupMemberCount,
  applyToGroup,
} from "../../services/group.service";
import * as pageCache from "../../utils/pageCache";
import { isCloudinaryUrl, applyTransform } from "../../utils/cloudinaryTransform";
import { showToast } from "../../utils/toast";
import SkeletonBox from "../../components/ui/SkeletonBox";
import ErrorState from "../../components/ui/ErrorState";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

const GROUP_DETAIL_IMG_TF = "w_800,h_400,c_fill,f_auto,q_auto";

const MEMBERSHIP_LABELS = {
  pending: "groups.pending",
  approved: "groups.approved",
  rejected: "groups.rejected",
  removed: "groups.removed",
};

const MEMBERSHIP_STYLES = {
  pending: {
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
    text: "text-amber-700 dark:text-amber-300",
    icon: "ri-time-line",
  },
  approved: {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-500/30",
    text: "text-emerald-700 dark:text-emerald-300",
    icon: "ri-check-double-line",
  },
  rejected: {
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/30",
    text: "text-red-600 dark:text-red-400",
    icon: "ri-close-circle-line",
  },
  removed: {
    bg: "bg-gray-50 dark:bg-gray-500/10",
    border: "border-gray-200 dark:border-gray-500/30",
    text: "text-gray-600 dark:text-gray-400",
    icon: "ri-forbid-line",
  },
};

export default function GroupDetails() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, profile, identity, authInitializing } = useAuth();
  const currentRole = profile?.role || identity?.role || user?.role;
  const isFarmer = currentRole === "farmer";

  const [group, setGroup] = useState(() => pageCache.get(`group_${groupId}`) || null);
  const [membership, setMembership] = useState(() => {
    if (!user?.uid || !groupId) return null;
    const direct = pageCache.get(`membership_${groupId}_${user.uid}`);
    if (direct) return direct;
    const myAll = pageCache.get(`my_memberships_${user.uid}`);
    if (Array.isArray(myAll)) {
      const found = myAll.find((m) => String(m.groupId).trim() === String(groupId).trim());
      if (found) return found;
    }
    const approvedAll = pageCache.get(`approvedUserGroups:${user.uid}`);
    if (Array.isArray(approvedAll)) {
      const found = approvedAll.find((g) => String(g.groupId || g.id).trim() === String(groupId).trim());
      if (found) return { groupId, status: "approved", ...found };
    }
    try {
      const pendingRaw = localStorage.getItem(`pending_app_${groupId}_${user.uid}`);
      if (pendingRaw) {
        const parsed = JSON.parse(pendingRaw);
        if (parsed && (parsed.status === "pending" || !parsed.status)) {
          return { ...parsed, status: "pending", groupId, userId: user.uid };
        }
      }
    } catch {}
    return null;
  });
  const [membershipLoaded, setMembershipLoaded] = useState(() => {
    if (!isFarmer || !user?.uid || !groupId) return true;
    if (pageCache.get(`membership_${groupId}_${user.uid}`)) return true;
    const myAll = pageCache.get(`my_memberships_${user.uid}`);
    if (Array.isArray(myAll)) return true;
    const approvedAll = pageCache.get(`approvedUserGroups:${user.uid}`);
    if (Array.isArray(approvedAll)) return true;
    try {
      if (localStorage.getItem(`pending_app_${groupId}_${user.uid}`)) return true;
    } catch {}
    return false;
  });
  const [memberCount, setMemberCount] = useState(() => {
    const cached = pageCache.get(`group_count_${groupId}`);
    return typeof cached === "number" && cached > 0 ? cached : null;
  });
  const [loading, setLoading] = useState(() => !pageCache.get(`group_${groupId}`));
  const [error, setError] = useState(null);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!pageCache.get(`group_${groupId}`)) {
          setLoading(true);
        }
        setError(null);

        const [groupData, count, membershipData] = await Promise.all([
          getGroup(groupId),
          getGroupMemberCount(groupId),
          user?.uid ? getMyMembership(groupId) : Promise.resolve(null),
        ]);

        if (!groupData) {
          if (!cancelled && !group) setError(t("groups.loadError"));
          return;
        }

        if (!cancelled) {
          setGroup(groupData);
          if (membershipData) {
            setMembership(membershipData);
          }
          setMembershipLoaded(true);
          const effectiveCount =
            membershipData?.status === "approved" ? Math.max(count, 1) : count;
          setMemberCount(effectiveCount);
        }
      } catch (err) {
        if (!cancelled && !group) {
          setError(err?.message || t("groups.loadError"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setMembershipLoaded(true);
        }
      }
    }

    load();

    // Subscribe to real-time membership changes (e.g. rejection or removal by admin/manager)
    let unsubMembership = () => {};
    if (user?.uid && groupId) {
      unsubMembership = subscribeToMyMembership(groupId, user.uid, (memData) => {
        if (!cancelled) {
          setMembership(memData);
          if (memData?.status === "approved") {
            setMemberCount((prev) => Math.max(prev ?? 0, 1));
          }
        }
      });
    }

    // Subscribe to real-time group members list
    let unsubMembers = () => {};
    if (groupId) {
      unsubMembers = subscribeToGroupMembers(groupId, (members) => {
        if (!cancelled && Array.isArray(members)) {
          setMemberCount(members.length);
        }
      });
    }

    return () => {
      cancelled = true;
      unsubMembership();
      unsubMembers();
    };
  }, [groupId, user?.uid, isFarmer, t]);

  async function handleApply() {
    try {
      setApplying(true);
      const result = await applyToGroup(groupId);
      setMembership(result);
      setMembershipLoaded(true);
      setShowApplyConfirm(false);
      showToast.success(t("groups.appliedSuccess"));
    } catch (err) {
      const isPermission = err?.message?.toLowerCase().includes("permission");
      const msg = isPermission ? t("groups.applyError") : (err?.message || t("groups.applyError"));
      showToast.error(msg);
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6 space-y-4">
        <SkeletonBox className="h-7 w-48" />
        <SkeletonBox className="aspect-[2/1] w-full" />
        <SkeletonBox className="h-4 w-32" />
        <SkeletonBox className="h-16 w-full" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <ErrorState
          message={error || t("groups.loadError")}
          onRetry={() => navigate("/groups")}
          retryLabel={t("groups.back")}
        />
      </div>
    );
  }

  const rawImage = group.imageUrl;
  const image =
    !rawImage
      ? null
      : isCloudinaryUrl(rawImage)
        ? applyTransform(rawImage, GROUP_DETAIL_IMG_TF)
        : rawImage;

  const membershipStatus = membership?.status || null;
  const canApply =
    isFarmer &&
    membershipLoaded &&
    (!membershipStatus || membershipStatus === "rejected" || membershipStatus === "removed");
  const displayMemberCount =
    membershipStatus === "approved"
      ? Math.max(memberCount ?? 0, 1)
      : (memberCount ?? 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Back button (hidden on mobile to prevent duplicate with header back button) */}
      <button
        onClick={() => navigate("/groups")}
        className="hidden sm:flex items-center gap-1.5 text-sm lg:text-base font-semibold text-(--agri-text-muted) hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) transition-colors cursor-pointer"
      >
        <i className="ri-arrow-left-line" />
        {t("groups.back")}
      </button>

      {/* Hero image */}
      {image ? (
        <div className="relative w-full overflow-hidden rounded-2xl border border-(--agri-border)/80 bg-[#F0F5F2] dark:bg-(--agri-hover) shadow-md shadow-black/5">
          <img
            src={image}
            alt={group.name}
            width={800}
            height={400}
            loading="lazy"
            decoding="async"
            className="h-52 sm:h-72 lg:h-80 w-full object-cover"
          />
          {group.active === false && (
            <div className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md border border-white/20">
              {t("groups.inactive")}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-52 sm:h-72 lg:h-80 w-full items-center justify-center rounded-2xl border border-(--agri-border)/80 bg-[#F0F5F2] dark:bg-(--agri-hover) shadow-md shadow-black/5">
          <i className="ri-team-line text-6xl text-[#2D6A4F]/15 dark:text-(--agri-brand)/15" />
        </div>
      )}

      {/* Group info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-(--agri-text) tracking-tight">
            {group.name}
          </h1>

          <div className="mt-2 flex items-center gap-3 text-sm lg:text-base text-(--agri-text-muted)">
            <span className="flex items-center gap-1.5 font-medium">
              <i className="ri-team-line text-[#2D6A4F] dark:text-(--agri-brand)" />
              {t("groups.memberCount", { count: displayMemberCount })}
            </span>
            {group.active === false && (
              <span className="flex items-center gap-1.5 text-gray-400 font-medium">
                <i className="ri-pause-circle-line" />
                {t("groups.inactive")}
              </span>
            )}
          </div>
        </div>

        {canApply && (
          <Button
            variant="primary"
            size="md"
            icon={membershipStatus === "rejected" || membershipStatus === "removed" ? "ri-restart-line" : "ri-user-add-line"}
            className="w-full sm:w-auto font-bold shadow-md shadow-[#2D6A4F]/20 shrink-0 lg:px-6 lg:py-2.5 lg:text-base"
            onClick={() => setShowApplyConfirm(true)}
            disabled={group.active === false}
          >
            {membershipStatus === "rejected" || membershipStatus === "removed"
              ? (t("groups.applyAgain") || "Apply to Join Again")
              : (t("groups.applyToJoin") || "Apply to Join")}
          </Button>
        )}
      </div>

      {/* Description */}
      {group.description && (
        <div className="rounded-2xl border border-(--agri-border)/80 bg-(--agri-card) p-5 lg:p-6 shadow-sm shadow-black/5 space-y-2">
          <h2 className="text-xs lg:text-sm font-bold uppercase tracking-wider text-(--agri-text-muted)">
            {t("groups.description")}
          </h2>
          <p className="text-sm lg:text-base leading-relaxed text-(--agri-text-secondary)">
            {group.description}
          </p>
        </div>
      )}

      {/* Membership status (farmers only) */}
      {isFarmer && membershipStatus && membershipStatus !== "none" && (
        <MembershipPanel
          status={membershipStatus}
          membership={membership}
          onApply={() => setShowApplyConfirm(true)}
          t={t}
        />
      )}

      {/* Apply confirmation dialog */}
      <ConfirmDialog
        open={showApplyConfirm}
        onClose={() => setShowApplyConfirm(false)}
        onConfirm={handleApply}
        title={
          membershipStatus === "rejected" || membershipStatus === "removed"
            ? (t("groups.applyAgain") || "Apply to Join Again")
            : (t("groups.applyConfirm") || "Apply to Join")
        }
        description={t("groups.applyConfirmDesc")}
        confirmLabel={
          membershipStatus === "rejected" || membershipStatus === "removed"
            ? (t("groups.applyAgain") || "Apply to Join Again")
            : (t("groups.applyToJoin") || "Apply to Join")
        }
        icon={membershipStatus === "rejected" || membershipStatus === "removed" ? "ri-restart-line" : "ri-door-open-line"}
        loading={applying}
      />
    </div>
  );
}

function MembershipPanel({ status, membership, onApply, t }) {
  const style = MEMBERSHIP_STYLES[status];
  if (!style) return null;

  const labelKey = MEMBERSHIP_LABELS[status];
  const dateField =
    status === "approved"
      ? (membership?.joinedAt || membership?.appliedAt)
      : status === "rejected"
        ? (membership?.rejectedAt || membership?.updatedAt || membership?.appliedAt)
        : status === "removed"
          ? (membership?.removedAt || membership?.updatedAt)
          : (membership?.appliedAt || membership?.createdAt);

  const dateKey =
    status === "approved"
      ? "groups.joinDate"
      : status === "rejected"
        ? "groups.rejectedDate"
        : status === "removed"
          ? "groups.removedDate"
          : "groups.appliedDate";

  let dateStr = "";
  if (dateField) {
    const d = dateField?.toDate ? dateField.toDate() : new Date(dateField);
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString();
    }
  }

  let title = t(labelKey);
  let desc = "";

  if (status === "rejected") {
    title = t("groups.applicationRejectedTitle") || "Your application was rejected";
    desc = t("groups.applicationRejectedDesc") || "Your application to join this group was not approved. You can apply again if you wish.";
  } else if (status === "removed") {
    title = t("groups.removedFromGroupTitle") || "You were removed from this group";
    desc = t("groups.removedFromGroupDesc") || "You are no longer a member of this group. You can submit a new application to re-join.";
  } else if (status === "pending") {
    desc = t("groups.pendingDesc") || "Your application is currently under review by the group manager.";
  }

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 lg:p-6 shadow-sm shadow-black/5 ${style.bg} ${style.border}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`flex h-11 w-11 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-2xl ${style.bg} border ${style.border} shadow-2xs`}>
            <i className={`${style.icon} text-xl lg:text-2xl ${style.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`text-sm sm:text-base lg:text-lg font-bold ${style.text}`}>
                {title}
              </p>
              {status === "approved" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 text-xs px-2.5 py-0.5 font-bold shadow-2xs">
                  <i className="ri-shield-check-fill text-xs" />
                  {t("groups.badgeActive")}
                </span>
              )}
            </div>

            {desc && (
              <p className="mt-1 text-xs sm:text-sm lg:text-base text-(--agri-text-secondary) leading-relaxed">
                {desc}
              </p>
            )}

            {dateStr && (
              <p className="mt-1 text-xs text-(--agri-text-muted)">
                {t(dateKey, { date: dateStr })}
              </p>
            )}
          </div>
        </div>

        {(status === "rejected" || status === "removed") && typeof onApply === "function" && (
          <div className="shrink-0 pt-2 sm:pt-0">
            <Button
              variant="primary"
              size="sm"
              icon="ri-restart-line"
              className="w-full sm:w-auto font-bold shadow-sm shadow-[#2D6A4F]/20"
              onClick={onApply}
            >
              {t("groups.applyAgain") || "Apply to Join Again"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
