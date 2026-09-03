import { useLanguage } from "../../../context/LanguageContext";

export default function ConsumerProfileDetails({ profile, stats }) {
  const { t } = useLanguage();

  if (!profile) return null;

  const { completedDeals = 0, totalDeals = 0, loading: statsLoading } = stats;

  const isTrusted = completedDeals >= 6 || profile.verified;

  const completionRate =
    totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100) : 100;

  return (
    <section className="px-4 sm:px-6 py-6 border-t border-[var(--agri-border-subtle)]">
      {/* About / Bio */}
      <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] shadow-sm p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--agri-text)] mb-3">
          <i className="ri-user-3-line text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
          {t("consumerProfile.about")}
        </h2>

        <p className="leading-relaxed text-sm sm:text-base text-[var(--agri-text-secondary)] whitespace-pre-wrap font-normal">
          {profile.bio || t("consumerProfile.noBioYet")}
        </p>
      </div>

      {/* Buyer Trust Summary */}
      <div className="mt-4 p-3 rounded-2xl bg-[#E8F5EE]/70 border border-[#CDE5D6]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] sm:text-xs font-bold text-[#1B4332] dark:text-[var(--agri-brand-light)] flex items-center gap-1">
            <i className="ri-shield-user-line text-sm text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
            <span>{t("userProfileModal.buyerTrustTitle")}</span>
          </span>

          {isTrusted && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-[var(--agri-card)] px-1.5 py-0.5 rounded border border-emerald-200/60">
              {t("userProfileModal.verified")}
            </span>
          )}
        </div>

        {statsLoading ? (
          <div className="py-2.5 text-center text-xs text-[var(--agri-text-muted)] flex items-center justify-center gap-2">
            <i className="ri-loader-4-line animate-spin text-sm text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
            <span>{t("userProfileModal.checkingHistory")}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-[var(--agri-card)] rounded-xl border border-[var(--agri-border-subtle)] text-center">
              <p className="text-lg font-black text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                {completedDeals}
              </p>
              <p className="text-[10px] font-bold text-[var(--agri-text-secondary)] uppercase tracking-tight">
                {t("userProfileModal.completedDeals")}
              </p>
            </div>

            <div className="p-2 bg-[var(--agri-card)] rounded-xl border border-[var(--agri-border-subtle)] text-center">
              <p className="text-lg font-black text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                {completionRate}%
              </p>
              <p className="text-[10px] font-bold text-[var(--agri-text-secondary)] uppercase tracking-tight">
                {t("userProfileModal.successRate")}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}