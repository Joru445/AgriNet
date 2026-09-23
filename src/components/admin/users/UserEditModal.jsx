import { useEffect, useState } from "react";
import RoleBadge from "../../ui/RoleBadge";
import { useLanguage } from "../../../context/LanguageContext";
import ResponsiveModal from "../../ui/ResponsiveModal";
import { DURATION_OPTIONS } from "../../../utils/suspensionOptions";
import Button from "../../ui/Button";

export default function UserEditModal({
  user,
  farmer,
  loading,
  onClose,
  onSave,
}) {
  const { t } = useLanguage();
  const [status, setStatus] = useState("active");
  const [verified, setVerified] = useState(false);
  const [suspensionDuration, setSuspensionDuration] = useState("7d");
  const [suspensionReason, setSuspensionReason] = useState("");

  useEffect(() => {
    if (!user) return;

    setStatus(user.status || "active");

    if (user.role === "farmer") {
      setVerified(farmer?.verificationStatus === "approved" || farmer?.verified === true);
    } else {
      setVerified(false);
    }

    setSuspensionReason("");
    setSuspensionDuration("7d");
  }, [user, farmer]);

  if (!user) return null;

  const isFarmer = user.role === "farmer";
  const originalStatus = user.status || "active";
  const originalVerified = farmer?.verificationStatus === "approved" || farmer?.verified === true;
  const statusChanged = status !== originalStatus;
  const verificationChanged = isFarmer && verified !== originalVerified;
  const isSuspending = status === "suspended" && statusChanged;
  const hasChanges = statusChanged || verificationChanged;

  async function handleSubmit(e) {
    e.preventDefault();

    if (!hasChanges) {
      onClose();
      return;
    }

    const updates = {};

    if (statusChanged) {
      updates.status = status;

      if (isSuspending) {
        updates.durationPreset = suspensionDuration;
        updates.reason = suspensionReason;
      }
    }

    if (verificationChanged) {
      updates.verified = verified;
    }

    await onSave(user.uid, updates);
  }

  return (
    <ResponsiveModal
      open={Boolean(user)}
      onClose={onClose}
      title={t("adminUser.editTitle")}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* User Identity Card */}
        <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-(--agri-card) border border-(--agri-border-subtle) shadow-xs hover:shadow-sm transition-shadow">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.fullname}
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[#2D6A4F]/20 shadow-2xs"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F]/10 dark:bg-(--agri-brand-bg) text-base font-black text-[#2D6A4F] dark:text-(--agri-brand) ring-2 ring-[#2D6A4F]/20 shadow-2xs">
              {user.fullname
                ?.split(/\s+/)
                .slice(0, 2)
                .map((name) => name[0])
                .join("")
                .toUpperCase() || "U"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm sm:text-base font-bold text-(--agri-text) truncate">
              {user.fullname || t("adminUser.unnamedUser")}
            </p>
            <p className="text-xs text-(--agri-text-muted) font-medium truncate">
              {user.email || t("adminUser.noEmail")}
            </p>
          </div>

          <div className="shrink-0">
            <RoleBadge role={user.role || "consumer"} />
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) p-4 sm:p-5 shadow-xs hover:shadow-sm transition-shadow space-y-4">
          {/* Role (Read-only) */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
              {t("adminUser.userRole")}
            </label>

            <div className="flex items-center justify-between rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 shadow-2xs">
              <RoleBadge role={user.role || "consumer"} />
              <span className="text-[11px] font-semibold text-(--agri-text-muted)">
                {t("adminUser.fixedRole")}
              </span>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
              {t("adminUser.accountStatus")}
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover)/50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-[#2D6A4F] focus:bg-(--agri-card) focus:ring-2 focus:ring-[#2D6A4F]/15 cursor-pointer disabled:opacity-60 shadow-2xs"
            >
              <option value="active">{t("adminUser.active")}</option>
              <option value="suspended">{t("adminUser.suspended")}</option>
            </select>
          </div>

          {/* Suspension Options */}
          {isSuspending && (
            <div className="space-y-3 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-4 shadow-xs">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 text-xs shadow-2xs">
                  <i className="ri-alert-line" />
                </span>
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  {t("adminUser.suspensionOptions")}
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  {t("adminUser.suspensionDuration")}
                </label>
                <select
                  value={suspensionDuration}
                  onChange={(e) => setSuspensionDuration(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-amber-200 dark:border-amber-500/20 bg-(--agri-card) px-3 py-2 text-xs sm:text-sm font-semibold text-(--agri-text) outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 cursor-pointer disabled:opacity-60 shadow-2xs"
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  {t("adminUser.suspensionReason")} *
                </label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder={t("adminUser.suspensionReasonPlaceholder")}
                  rows={2}
                  disabled={loading}
                  className="w-full rounded-xl border border-amber-200 dark:border-amber-500/20 bg-(--agri-card) px-3 py-2 text-xs sm:text-sm text-(--agri-text) outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/15 resize-none disabled:opacity-60 shadow-2xs"
                />
              </div>
            </div>
          )}

          {/* Farmer Verification Toggle */}
          {isFarmer && (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-(--agri-text-muted)">
                {t("adminUser.farmerVerification")}
              </label>

              <button
                type="button"
                onClick={() => setVerified((current) => !current)}
                disabled={loading}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition cursor-pointer shadow-xs ${
                  verified
                    ? "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/15"
                    : "border-(--agri-border-subtle) bg-(--agri-hover)/50 hover:bg-(--agri-hover)"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      verified ? "text-emerald-700 dark:text-emerald-300" : "text-(--agri-text-secondary)"
                    }`}
                  >
                    {verified ? t("adminUser.verifiedFarmer") : t("adminUser.notVerified")}
                  </p>

                  <p className="mt-0.5 text-xs text-(--agri-text-muted) font-medium">
                    {verified
                      ? t("adminUser.verifiedBadgeDesc")
                      : t("adminUser.notVerifiedBadgeDesc")}
                  </p>
                </div>

                <div
                  className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors shadow-2xs ${
                    verified ? "bg-[#2D6A4F]" : "bg-(--agri-border)"
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full bg-white shadow-xs transition-transform ${
                      verified ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-(--agri-border-subtle)">
          <Button
            variant="cancel"
            size="md"
            onClick={onClose}
            disabled={loading}
            className="shadow-2xs"
          >
            {t("common.cancel")}
          </Button>

          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={loading}
            disabled={!hasChanges || (isSuspending && !suspensionReason.trim())}
            className="shadow-xs"
          >
            {t("adminUser.saveChanges")}
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
}
