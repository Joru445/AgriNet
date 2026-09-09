import { useEffect, useState } from "react";
import RoleBadge from "../../common/RoleBadge";
import { useLanguage } from "../../../context/LanguageContext";
import ResponsiveModal from "../../ui/ResponsiveModal";
import { DURATION_OPTIONS } from "../../../utils/suspensionOptions";

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
      maxWidth="max-w-md"
    >

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* User Quick Identity Card */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--agri-hover)]/90 border border-[var(--agri-border-subtle)]">
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullname}
                className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[#D8F3DC]"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D8F3DC] dark:bg-[var(--agri-brand-bg)] text-sm font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                {user.fullname
                  ?.split(/\s+/)
                  .slice(0, 2)
                  .map((name) => name[0])
                  .join("")
                  .toUpperCase() || "U"}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[var(--agri-text)] truncate">
                {user.fullname || t("adminUser.unnamedUser")}
              </p>
              <p className="text-xs text-[var(--agri-text-muted)] font-medium truncate">
                {user.email || t("adminUser.noEmail")}
              </p>
            </div>
          </div>

          {/* Role (Read-only) */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
              {t("adminUser.userRole")}
            </label>

            <div className="flex items-center justify-between rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/70 px-3.5 py-2.5">
              <RoleBadge role={user.role || "consumer"} />
              <span className="text-[11px] font-semibold text-[var(--agri-text-muted)]">
                {t("adminUser.fixedRole")}
              </span>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
              {t("adminUser.accountStatus")}
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/50 px-3.5 py-2.5 text-sm font-semibold text-[var(--agri-text)] outline-none transition focus:border-[#2D6A4F] focus:bg-[var(--agri-card)] focus:ring-2 focus:ring-[#2D6A4F]/10 cursor-pointer disabled:opacity-60"
            >
              <option value="active">{t("adminUser.active")}</option>
              <option value="suspended">{t("adminUser.suspended")}</option>
            </select>
          </div>

          {/* Suspension Options */}
          {isSuspending && (
            <div className="space-y-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                {t("adminUser.suspensionOptions")}
              </p>

              {/* Duration */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  {t("adminUser.suspensionDuration")}
                </label>
                <select
                  value={suspensionDuration}
                  onChange={(e) => setSuspensionDuration(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-lg border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-[var(--agri-card)] px-3 py-2 text-sm font-semibold text-[var(--agri-text)] outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 cursor-pointer disabled:opacity-60"
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
                <label className="mb-1 block text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  {t("adminUser.suspensionReason")} *
                </label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder={t("adminUser.suspensionReasonPlaceholder")}
                  rows={2}
                  disabled={loading}
                  className="w-full rounded-lg border border-amber-200 dark:border-amber-500/30 bg-white dark:bg-[var(--agri-card)] px-3 py-2 text-sm text-[var(--agri-text)] outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/10 resize-none disabled:opacity-60"
                />
              </div>
            </div>
          )}

          {/* Farmer Verification Toggle */}
          {isFarmer && (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("adminUser.farmerVerification")}
              </label>

              <button
                type="button"
                onClick={() => setVerified((current) => !current)}
                disabled={loading}
                className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition cursor-pointer ${
                  verified
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-[var(--agri-border-subtle)] bg-[var(--agri-hover)]/70 hover:bg-[var(--agri-hover)]/70"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      verified ? "text-emerald-800" : "text-[var(--agri-text-secondary)]"
                    }`}
                  >
                    {verified ? t("adminUser.verifiedFarmer") : t("adminUser.notVerified")}
                  </p>

                  <p className="mt-0.5 text-xs text-[var(--agri-text-muted)] font-medium">
                    {verified
                      ? t("adminUser.verifiedBadgeDesc")
                      : t("adminUser.notVerifiedBadgeDesc")}
                  </p>
                </div>

                <div
                  className={`flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition-colors ${
                    verified ? "bg-[#2D6A4F]" : "bg-[var(--agri-hover)]"
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

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--agri-border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2.5 px-4 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-card)] text-xs sm:text-sm font-bold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("common.cancel")}
            </button>

            <button
              type="submit"
              disabled={loading || !hasChanges || (isSuspending && !suspensionReason.trim())}
              className="flex items-center gap-1.5 py-2.5 px-5 rounded-xl bg-[#2D6A4F] text-white text-xs sm:text-sm font-bold hover:bg-[#1B4332] active:scale-[0.99] transition cursor-pointer shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-sm" />
                   <span>{t("adminUser.saving")}</span>
                </>
              ) : (
                <span>{t("adminUser.saveChanges")}</span>
              )}
            </button>
          </div>
        </form>
    </ResponsiveModal>
  );
}
