import { Link } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import Avatar from "../../common/Avatar";

export default function NearbyFarmerCard({ farmer }) {
  const { t } = useLanguage();
  return (
    <div className="group flex flex-col justify-between h-full rounded-2xl border border-[var(--agri-border)]/90 bg-[var(--agri-card)] p-3.5 sm:p-4 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5">
      <div>
        {/* Top Header: Avatar + Farmer Info */}
        <div className="flex items-start gap-2.5 sm:gap-3 text-left">
          <div className="relative shrink-0">
            <Avatar
              src={farmer.profilePicture}
              name={farmer.fullname}
              size="md"
              className="w-11 h-11 sm:w-12 sm:h-12 ring-2 ring-[#D8F3DC]"
            />
            {farmer.verified && (
              <span
                title={t("common.verifiedFarmer")}
                aria-label={t("common.verifiedFarmer")}
                className="absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center rounded-full bg-[var(--agri-card)] text-[#2D6A4F] dark:text-[var(--agri-brand)] text-[11px] shadow-xs"
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xs sm:text-sm text-[var(--agri-text)] truncate group-hover:text-[#2D6A4F] dark:hover:text-[var(--agri-brand)] transition-colors leading-tight">
              {farmer.fullname}
            </h3>

            <p className="text-[11px] sm:text-xs text-[var(--agri-text-muted)] truncate mt-0.5">
              @{farmer.username}
            </p>

            {farmer.farmName && (
              <p className="text-[10px] sm:text-[11px] text-[var(--agri-text-muted)] truncate mt-0.5 flex items-center gap-1">
                <i className="ri-store-2-line text-[var(--agri-text-muted)] shrink-0 text-xs" />
                <span className="truncate">{farmer.farmName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Distance & Rating Section */}
        <div className="mt-3 space-y-1.5 text-xs pt-2.5 border-t border-[var(--agri-border-subtle)]">
          <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
            <span className="text-[var(--agri-text-muted)] flex items-center gap-1 shrink-0">
              <i className="ri-map-pin-range-line text-[var(--agri-text-muted)] text-xs" />
              <span>{t("nearby.distance")}</span>
            </span>

            <span className="font-semibold text-[#2D6A4F] dark:text-[var(--agri-brand)] bg-[#D8F3DC]/40 dark:bg-[var(--agri-brand-bg)]/40 px-1.5 py-0.5 rounded text-[11px] shrink-0">
              {farmer.distance != null ? `${farmer.distance.toFixed(1)} km` : "--"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs">
            <span className="text-[var(--agri-text-muted)] flex items-center gap-1 shrink-0">
              <i className="ri-star-line text-[var(--agri-text-muted)] text-xs" />
              <span>{t("nearby.rating")}</span>
            </span>

            {farmer.rating != null && Number(farmer.rating) > 0 ? (
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                <i className="ri-star-fill text-amber-500 text-xs" />
                <span className="font-bold text-[var(--agri-text)] text-[11px]">
                  {Number(farmer.rating).toFixed(1)}
                </span>
                {farmer.reviewCount > 0 && (
                  <span className="text-[var(--agri-text-muted)] font-medium text-[10px]">
                    ({farmer.reviewCount})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[var(--agri-text-muted)] font-medium text-[11px] shrink-0">
                {t("nearby.noReviews")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-1">
        <Link
          to={`/profile/${farmer.uid}`}
          className="block w-full rounded-xl border border-[#2D6A4F] bg-[var(--agri-card)] py-1.5 sm:py-2 text-center text-xs font-semibold text-[#2D6A4F] dark:text-[var(--agri-brand)] hover:bg-[#2D6A4F] hover:text-white active:scale-98 shadow-xs hover:shadow-md transition-all duration-150"
        >
          {t("nearby.viewProfile")}
        </Link>
      </div>
    </div>
  );
}