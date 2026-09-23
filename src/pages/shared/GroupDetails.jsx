import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import {
  getGroup,
  getMyMembership,
  getGroupMemberCount,
  applyToGroup,
} from "../../services/group.service";
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
  const { user } = useAuth();
  const isFarmer = user?.role === "farmer";

  const [group, setGroup] = useState(null);
  const [membership, setMembership] = useState(null);
  const [memberCount, setMemberCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showApplyConfirm, setShowApplyConfirm] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [groupData, count] = await Promise.all([
          getGroup(groupId),
          getGroupMemberCount(groupId),
        ]);

        if (!groupData) {
          if (!cancelled) setError(t("groups.loadError"));
          return;
        }

        let membershipData = null;
        if (isFarmer) {
          membershipData = await getMyMembership(groupId);
        }

        if (!cancelled) {
          setGroup(groupData);
          setMemberCount(count);
          setMembership(membershipData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || t("groups.loadError"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [groupId, isFarmer, t]);

  async function handleApply() {
    try {
      setApplying(true);
      const result = await applyToGroup(groupId);
      setMembership(result);
      setShowApplyConfirm(false);
      showToast.success(t("groups.appliedSuccess"));
    } catch (err) {
      showToast.error(err?.message || t("groups.applyError"));
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
  const canApply = isFarmer && (!membershipStatus || membershipStatus === "rejected" || membershipStatus === "removed");

  return (
    <div className="px-4 py-6 sm:px-6 space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate("/groups")}
        className="flex items-center gap-1.5 text-sm font-medium text-(--agri-text-muted) hover:text-[#2D6A4F] dark:hover:text-(--agri-brand) transition-colors"
      >
        <i className="ri-arrow-left-line" />
        {t("groups.back")}
      </button>

      {/* Hero image */}
      {image ? (
        <div className="relative w-full overflow-hidden rounded-2xl border border-(--agri-border-subtle) bg-[#F0F5F2] dark:bg-(--agri-hover)">
          <img
            src={image}
            alt={group.name}
            width={800}
            height={400}
            className="h-48 sm:h-64 w-full object-cover"
          />
          {group.active === false && (
            <div className="absolute left-3 top-3 rounded-full bg-gray-800/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
              {t("groups.inactive")}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-48 sm:h-64 w-full items-center justify-center rounded-2xl border border-(--agri-border-subtle) bg-[#F0F5F2] dark:bg-(--agri-hover)">
          <i className="ri-team-line text-6xl text-[#2D6A4F]/15 dark:text-(--agri-brand)/15" />
        </div>
      )}

      {/* Group info */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[#1B4332] dark:text-(--agri-brand-light)">
          {group.name}
        </h1>

        <div className="mt-2 flex items-center gap-3 text-sm text-(--agri-text-muted)">
          <span className="flex items-center gap-1">
            <i className="ri-team-line text-[#2D6A4F] dark:text-(--agri-brand)" />
            {t("groups.memberCount", { count: memberCount ?? 0 })}
          </span>
          {group.active === false && (
            <span className="flex items-center gap-1 text-gray-400">
              <i className="ri-pause-circle-line" />
              {t("groups.inactive")}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {group.description && (
        <div className="rounded-xl border border-(--agri-border-subtle) bg-(--agri-card) p-4">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-(--agri-text-muted)">
            {t("groups.description")}
          </h2>
          <p className="text-sm leading-relaxed text-(--agri-text-secondary)">
            {group.description}
          </p>
        </div>
      )}

      {/* Membership status (farmers only) */}
      {isFarmer && membershipStatus && membershipStatus !== "none" && (
        <MembershipPanel status={membershipStatus} membership={membership} t={t} />
      )}

      {/* Apply button (farmers only) */}
      {canApply && (
        <div className="flex justify-center">
          <Button
            variant="primary"
            size="md"
            icon="ri-door-open-line"
            onClick={() => setShowApplyConfirm(true)}
            disabled={group.active === false}
          >
            {t("groups.applyToJoin")}
          </Button>
        </div>
      )}

      {/* Apply confirmation dialog */}
      <ConfirmDialog
        open={showApplyConfirm}
        onClose={() => setShowApplyConfirm(false)}
        onConfirm={handleApply}
        title={t("groups.applyConfirm")}
        description={t("groups.applyConfirmDesc")}
        confirmLabel={t("groups.applyToJoin")}
        icon="ri-door-open-line"
        loading={applying}
      />
    </div>
  );
}

function MembershipPanel({ status, membership, t }) {
  const style = MEMBERSHIP_STYLES[status];
  if (!style) return null;

  const labelKey = MEMBERSHIP_LABELS[status];
  const dateField = status === "approved" ? membership.joinedAt : membership.createdAt;
  const dateKey = status === "approved" ? "groups.joinDate" : "groups.appliedDate";

  let dateStr = "";
  if (dateField) {
    const d = dateField?.toDate ? dateField.toDate() : new Date(dateField);
    dateStr = d.toLocaleDateString();
  }

  return (
    <div className={`rounded-xl border p-4 ${style.bg} ${style.border}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
          <i className={`${style.icon} text-lg ${style.text}`} />
        </div>
        <div>
          <p className={`text-sm font-bold ${style.text}`}>
            {t(labelKey)}
          </p>
          {dateStr && (
            <p className="mt-0.5 text-xs text-(--agri-text-muted)">
              {t(dateKey, { date: dateStr })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
