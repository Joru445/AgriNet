import { useState } from "react";
import RoleBadge from "../../ui/RoleBadge";
import ImageViewerModal from "../../ui/ImageViewerModal";
import { useLanguage } from "../../../context/LanguageContext";
import ResponsiveModal from "../../ui/ResponsiveModal";
import Button from "../../ui/Button";

export default function UserDetailsModal({ user, farmer, onClose }) {
  const { t } = useLanguage();
  const [fullscreenImage, setFullscreenImage] = useState(null);

  function formatFullDateTime(timestamp) {
    if (!timestamp) return t("adminUser.naLabel");

    let date = null;
    if (typeof timestamp?.toDate === "function") {
      date = timestamp.toDate();
    } else if (timestamp?.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === "string" || typeof timestamp === "number") {
      date = new Date(timestamp);
    }

    if (!date || isNaN(date.getTime())) {
      return t("adminUser.naLabel");
    }

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (!user) return null;

  const isSuspended = user.status === "suspended";
  const isFarmer = user.role === "farmer";
  const isVerifiedFarmer =
    user.verificationStatus === "approved" ||
    user.verified === true ||
    farmer?.verificationStatus === "approved" ||
    farmer?.verified === true;

  // Build complete location string
  const locationParts = [
    user.address,
    user.barangay ? `Brgy. ${user.barangay}` : null,
    user.municipality || user.city,
    user.province,
    user.postalCode,
  ].filter(Boolean);

  const fullLocation =
    user.location?.address ||
    (locationParts.length > 0 ? locationParts.join(", ") : null) ||
    t("adminUser.noAddressProvided");

  return (
    <ResponsiveModal
      open={Boolean(user)}
      onClose={onClose}
      title={t("adminUser.detailsTitle")}
      maxWidth="max-w-xl"
    >
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Profile Card / Avatar Overview */}
        <div className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.fullname}
                  onClick={() =>
                    setFullscreenImage({
                      src: user.profilePicture,
                      title: `${user.fullname || user.username}'s Profile Picture`,
                    })
                  }
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-[#2D6A4F]/20 shadow-xs cursor-pointer hover:opacity-90 transition"
                  title={t("adminUser.clickToViewPhoto")}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2D6A4F]/10 dark:bg-(--agri-brand-bg) text-2xl font-black text-[#2D6A4F] dark:text-(--agri-brand) ring-4 ring-[#2D6A4F]/20 shadow-xs">
                  {user.fullname
                    ?.split(/\s+/)
                    .slice(0, 2)
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase() || "U"}
                </div>
              )}

              {isVerifiedFarmer && (
                <span
                  className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#2D6A4F] text-white ring-2 ring-(--agri-card) shadow-2xs"
                  title={t("adminUser.verifiedAccount")}
                >
                  <i className="ri-check-line text-xs font-bold" />
                </span>
              )}
            </div>

            <h4 className="text-lg font-bold text-(--agri-text) tracking-tight">
              {user.fullname || t("adminUser.unnamedUser")}
            </h4>

            <p className="text-xs font-semibold text-(--agri-text-muted) mb-2.5">
              @{user.username || "user"}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <RoleBadge role={user.role || "consumer"} />

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                  isSuspended
                    ? "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/25"
                    : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isSuspended ? "bg-red-500" : "bg-emerald-500"
                  }`}
                />
                {isSuspended ? t("adminUser.suspendedAccount") : t("adminUser.activeAccount")}
              </span>

              {isFarmer && (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shadow-2xs ${
                    isVerifiedFarmer
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25"
                      : "bg-gray-500/10 text-(--agri-text-muted) border-gray-500/20"
                  }`}
                >
                  <i className={isVerifiedFarmer ? "ri-verified-badge-fill" : "ri-shield-line"} />
                  {isVerifiedFarmer ? t("adminUser.verifiedFarmer") : t("adminUser.notVerified")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User Information Grid */}
        <div className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-[#52B788] text-xs shadow-2xs">
              <i className="ri-user-3-line" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wide text-(--agri-text)">
              {t("adminUser.detailsTitle")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Full Name */}
            <div className="p-3 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-(--agri-text-muted) block">
                {t("adminUser.fullName")}
              </span>
              <p className="font-bold text-sm text-(--agri-text) truncate mt-0.5">
                {user.fullname || t("adminUser.naLabel")}
              </p>
            </div>

            {/* Username */}
            <div className="p-3 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-(--agri-text-muted) block">
                {t("adminUser.username")}
              </span>
              <p className="font-bold text-sm text-(--agri-text) truncate mt-0.5">
                @{user.username || "user"}
              </p>
            </div>

            {/* Email Address */}
            <div className="p-3 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-(--agri-text-muted) block">
                {t("adminUser.emailAddress")}
              </span>
              <p className="font-bold text-sm text-(--agri-text) break-all mt-0.5">
                {user.email || t("adminUser.noEmailProvided")}
              </p>
            </div>

            {/* Phone Number */}
            <div className="p-3 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-(--agri-text-muted) block">
                {t("adminUser.phoneNumber")}
              </span>
              <p className="font-bold text-sm text-(--agri-text) mt-0.5">
                {user.phone || user.contactNumber || t("adminUser.noPhoneProvided")}
              </p>
            </div>
          </div>
        </div>

        {/* Location & Address Card */}
        <div className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3.5">
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs shadow-2xs">
              <i className="ri-map-pin-2-line" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wide text-(--agri-text)">
              {t("adminUser.fullLocation")}
            </h3>
          </div>

          <div className="p-3 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs text-xs space-y-1">
            <p className="font-semibold text-sm text-(--agri-text) leading-relaxed">
              {fullLocation}
            </p>
            {user.location?.latitude && user.location?.longitude && (
              <p className="text-[11px] text-(--agri-text-muted) font-mono pt-1">
                GPS: {user.location.latitude}, {user.location.longitude}
              </p>
            )}
          </div>
        </div>

        {/* Bio / About */}
        {user.bio && (
          <div className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3.5">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs shadow-2xs">
                <i className="ri-file-text-line" />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wide text-(--agri-text)">
                {t("adminUser.bioAbout")}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs text-xs">
              <p className="text-(--agri-text) font-medium whitespace-pre-wrap leading-relaxed">
                {user.bio}
              </p>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
            <i className="ri-calendar-line text-sm text-[#2D6A4F] dark:text-(--agri-brand) shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-(--agri-text-muted) block">
                {t("adminUser.created")}
              </span>
              <p className="font-semibold text-xs text-(--agri-text) mt-0.5">
                {formatFullDateTime(user.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-(--agri-hover)/50 border border-(--agri-border-subtle) shadow-2xs">
            <i className="ri-time-line text-sm text-[#2D6A4F] dark:text-(--agri-brand) shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-(--agri-text-muted) block">
                {t("adminUser.updated")}
              </span>
              <p className="font-semibold text-xs text-(--agri-text) mt-0.5">
                {formatFullDateTime(user.updatedAt || user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Close Action */}
        <div className="flex justify-end pt-3 border-t border-(--agri-border-subtle)">
          <Button
            variant="cancel"
            size="md"
            onClick={onClose}
            className="shadow-2xs"
          >
            {t("adminUser.closeDetails")}
          </Button>
        </div>
      </div>

      {/* Fullscreen Zoomable Image Modal */}
      <ImageViewerModal
        isOpen={Boolean(fullscreenImage)}
        src={fullscreenImage?.src}
        title={fullscreenImage?.title}
        onClose={() => setFullscreenImage(null)}
      />
    </ResponsiveModal>
  );
}
