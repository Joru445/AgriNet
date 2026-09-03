import { useState } from "react";
import landscape from "../../../assets/img/landscapeCover.jpg";

import RoleBadge from "../../common/RoleBadge";
import ReportModal from "../../common/ReportModal";
import { getInitials } from "../../../utils/getInitials";
import { applyTransform, COVER_TF, PROFILE_TF, isCloudinaryUrl } from "../../../utils/cloudinaryTransform";
import { useLanguage } from "../../../context/LanguageContext";

export default function PublicProfileHeader({
  profile,
  role,
  averageRating,
  reviewCount,
  stats,
  onMessage,
}) {
  const { t } = useLanguage();
  const [showReportModal, setShowReportModal] = useState(false);

  const isFarmer = role === "farmer";

  const name = profile.storeName || profile.fullname || profile.username;
  const initials = getInitials(name);
  const joinedDate = profile.createdAt?.seconds
    ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
      })
    : null;

  const fullLocation = [
    profile.barangay,
    profile.municipality ||
      profile.location?.address ||
      profile.address,
  ]
    .filter(Boolean)
    .join(", ");

  const targetUid = profile.uid || profile.id;

  return (
    <section data-onboarding="store-header" className="bg-[var(--agri-card)]">
      {/* Cover Photo */}
      <div className="mx-auto max-w-7xl">
        <div
          className="
            relative
            h-56
            overflow-hidden
            bg-[var(--agri-hover)]
            sm:h-72
            md:h-80
            lg:h-[380px]
            sm:rounded-b-2xl
          "
        >
          <img
            src={
              isCloudinaryUrl(profile.coverPhoto)
                ? applyTransform(profile.coverPhoto, COVER_TF)
                : profile.coverPhoto || landscape
            }
            alt={t("storeProfile.cover")}
            width={1600}
            height={380}
            loading="lazy"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/10" />
        </div>
      </div>

      {/* Profile Information */}
      <div className="relative mx-auto max-w-7xl -mt-8 px-4 sm:mt-0 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 pt-4">
          {/* Left side: Avatar + Info */}
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="block shrink-0 -mt-8 sm:-mt-16 rounded-full border-4 border-[var(--agri-card)] shadow-md">
              {profile.profilePicture ? (
                <img
                  src={
                    isCloudinaryUrl(profile.profilePicture)
                      ? applyTransform(profile.profilePicture, PROFILE_TF)
                      : profile.profilePicture
                  }
                  alt={name}
                  className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover"
                  loading="lazy"
                  width={128}
                  height={128}
                />
              ) : (
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F] dark:text-[var(--agri-brand)] text-3xl font-bold">
                  {initials}
                </div>
              )}
            </div>

            {/* Text Info */}
            <div className="min-w-0 pb-1 sm:pb-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--agri-text)] truncate">
                  {name}
                </h1>
                {profile.verified && (
                  <span
                    title={t("common.verifiedFarmer")}
                    aria-label={t("common.verifiedFarmer")}
                    className="inline-flex shrink-0 items-center text-[#2D6A4F] dark:text-[var(--agri-brand)] text-lg"
                  >
                    <i className="ri-verified-badge-fill" />
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--agri-text-muted)] font-medium">
                @{profile.username}
              </p>
              <div className="mt-1.5">
                <RoleBadge role={isFarmer ? "farmer" : "consumer"} />
              </div>
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex flex-wrap items-center gap-3 sm:ml-auto pb-1 sm:pb-3">
            {onMessage && (
              <button
                type="button"
                onClick={onMessage}
                className="inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B4332] cursor-pointer"
              >
                <i className="ri-chat-1-line" />
                {t("storeProfile.message")}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--agri-border)] bg-transparent px-4 py-2.5 text-sm font-semibold text-[var(--agri-text-secondary)] transition hover:bg-[var(--agri-hover)] cursor-pointer"
            >
              <i className="ri-flag-line" />
              {t("storeProfile.report")}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-3 sm:py-4 border-t border-[var(--agri-border-subtle)]">
          {isFarmer ? (
            <>
              <div className="flex items-center gap-1.5">
                <i className="ri-star-fill text-amber-500" />
                <span className="text-sm font-bold text-[var(--agri-text)]">
                  {averageRating?.toFixed(1) || "N/A"}
                </span>
                <span className="text-xs text-[var(--agri-text-muted)]">
                  ({reviewCount || 0})
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <i className="ri-checkbox-circle-fill text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
                <span className="text-sm font-bold text-[var(--agri-text)]">
                  {stats.completedDeals ?? 0}
                </span>
                <span className="text-xs text-[var(--agri-text-muted)]">
                  {t("userProfileModal.completedDeals")}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <i className="ri-shield-check-line text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
                <span className="text-sm font-bold text-[var(--agri-text)]">
                  {stats.completedDeals >= 6 || profile.verified
                    ? "100"
                    : stats.totalDeals > 0
                      ? Math.round((stats.completedDeals / stats.totalDeals) * 100)
                      : 100}
                  %
                </span>
                <span className="text-xs text-[var(--agri-text-muted)]">
                  {t("userProfileModal.successRate")}
                </span>
              </div>
            </>
          )}

          {fullLocation && (
            <div className="flex items-center gap-1.5 text-sm text-[var(--agri-text-muted)]">
              <i className="ri-map-pin-line" />
              <span className="truncate max-w-[200px]">
                {fullLocation}
              </span>
            </div>
          )}

          {joinedDate && (
            <div className="flex items-center gap-1.5 text-sm text-[var(--agri-text-muted)]">
              <i className="ri-calendar-line" />
              <span>{t("storeProfile.joined", { date: joinedDate })}</span>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType={isFarmer ? "store" : "profile"}
        targetId={targetUid}
        targetTitle={name}
        reportedUser={profile}
      />
    </section>
  );
}