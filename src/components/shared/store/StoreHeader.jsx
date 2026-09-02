import { useState } from "react";
import { Link } from "react-router-dom";
import landscape from "../../../assets/img/landscapeCover.jpg";

import { getInitials } from "../../../utils/getInitials";
import { getStoreProfilePath } from "../../../utils/routes";
import ReportModal from "../../common/ReportModal";
import { applyTransform, COVER_TF, PROFILE_TF, isCloudinaryUrl } from "../../../utils/cloudinaryTransform";
import { useLanguage } from "../../../context/LanguageContext";

export default function StoreHeader({
  farmer,
  reviewCount,
  averageRating,
  onMessage,
}) {
  const { t } = useLanguage();
  const [showReportModal, setShowReportModal] = useState(false);
  const joinedDate = farmer.createdAt?.seconds
    ? new Date(farmer.createdAt.seconds * 1000).toLocaleDateString("en-PH", {
        month: "long",
        year: "numeric",
      })
    : "-";

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
              isCloudinaryUrl(farmer.coverPhoto)
                ? applyTransform(farmer.coverPhoto, COVER_TF)
                : farmer.coverPhoto || landscape
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
            <Link
              to={getStoreProfilePath(farmer)}
              className="block shrink-0 -mt-8 sm:-mt-16 rounded-full border-4 border-[var(--agri-card)] shadow-md hover:opacity-90 transition"
              title={`Visit ${farmer.storeName || farmer.fullname}'s profile`}
            >
              {farmer.profilePicture ? (
                <img
                  src={isCloudinaryUrl(farmer.profilePicture) ? applyTransform(farmer.profilePicture, PROFILE_TF) : farmer.profilePicture}
                  alt={farmer.storeName || farmer.fullname}
                  className="h-24 w-24 sm:h-32 sm:w-32 rounded-full object-cover"
                  loading="lazy"
                  width={128}
                  height={128}
                />
              ) : (
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F] dark:text-[var(--agri-brand)] text-3xl font-bold">
                  {getInitials(farmer.storeName || farmer.fullname)}
                </div>
              )}
            </Link>

            {/* Text Info */}
            <div className="min-w-0 pb-1 sm:pb-3">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--agri-text)] truncate">
                {farmer.storeName || farmer.fullname}
              </h1>
              <p className="text-sm text-[var(--agri-text-muted)] font-medium">
                @{farmer.username}
              </p>
            </div>
          </div>

          {/* Right side: Actions */}
          <div className="flex flex-wrap items-center gap-3 sm:ml-auto pb-1 sm:pb-3">
            <button
              type="button"
              onClick={onMessage}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1B4332] cursor-pointer"
            >
              <i className="ri-chat-1-line" />
              {t("storeProfile.message")}
            </button>

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
          <div className="flex items-center gap-1.5">
            <i className="ri-star-fill text-amber-500" />
            <span className="text-sm font-bold text-[var(--agri-text)]">{averageRating?.toFixed(1) || "N/A"}</span>
            <span className="text-xs text-[var(--agri-text-muted)]">({reviewCount || 0})</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-[var(--agri-text-muted)]">
            <i className="ri-map-pin-line" />
            <span className="truncate max-w-[200px]">{farmer.location?.address || "Lucena City"}</span>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-[var(--agri-text-muted)]">
            <i className="ri-calendar-line" />
            <span>{t("storeProfile.joined", { date: joinedDate })}</span>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="store"
        targetId={farmer.uid || farmer.id}
        targetTitle={farmer.storeName || farmer.fullname}
        reportedUser={farmer}
      />
    </section>
  );
}
