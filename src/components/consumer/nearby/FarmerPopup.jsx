import { Link } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import Avatar from "../../common/Avatar";

export default function FarmerPopup({ farmer, onMessage }) {
  const { t } = useLanguage();
  return (
    <div className="w-56 p-0.5 select-none text-left">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <Avatar
            src={farmer.profilePicture}
            name={farmer.fullname}
            size="sm"
            className="w-11 h-11 ring-2 ring-[#D8F3DC]"
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

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h2 className="font-bold text-sm text-[var(--agri-text)] truncate leading-tight !m-0 !p-0">
            {farmer.fullname}
          </h2>

          <p className="text-xs text-[var(--agri-text-muted)] truncate !m-0 !mt-0.5 !p-0 leading-tight">
            @{farmer.username}
          </p>

          {farmer.storeName && (
            <p className="text-[11px] text-[#2D6A4F] dark:text-[var(--agri-brand)] font-medium truncate !m-0 !mt-0.5 !p-0 leading-tight flex items-center gap-1">
              <i className="ri-store-2-line text-[11px] shrink-0 text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
              <span className="truncate">{farmer.storeName}</span>
            </p>
          )}
        </div>
      </div>

      {/* Distance & Rating Badges */}
      <div className="mt-3 flex items-center justify-between gap-1.5 pt-2.5 border-t border-[var(--agri-border-subtle)]">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D6A4F] dark:text-[var(--agri-brand)] bg-[#D8F3DC]/45 px-2 py-0.5 rounded-md">
          <i className="ri-map-pin-2-fill text-xs text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
          <span>{farmer.distance != null ? `${farmer.distance.toFixed(1)} km` : "--"}</span>
        </span>

        {farmer.rating != null && Number(farmer.rating) > 0 ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--agri-text)] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <i className="ri-star-fill text-amber-500 text-xs" />
            <span>{Number(farmer.rating).toFixed(1)}</span>
            {farmer.reviewCount > 0 && (
              <span className="text-[var(--agri-text-muted)] font-medium text-[11px]">({farmer.reviewCount})</span>
            )}
          </span>
        ) : (
          <span className="text-xs text-[var(--agri-text-muted)] font-medium">{t("nearby.noReviews")}</span>
        )}
      </div>

      {/* Bio / Description */}
      {farmer.bio && (
        <p className="!mt-2 !mb-0 !p-0 text-xs text-[var(--agri-text-secondary)] line-clamp-2 leading-relaxed">
          {farmer.bio}
        </p>
      )}

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <Link
          to={`/profile/${farmer.uid}`}
          className="flex-1 rounded-xl border border-[#2D6A4F] py-2 text-center text-xs font-semibold !text-[#2D6A4F] dark:text-[var(--agri-brand)] hover:!bg-[#2D6A4F] hover:!text-white transition shadow-xs"
        >
          {t("nearby.profile")}
        </Link>

        <button
          type="button"
          onClick={onMessage}
          className="flex-1 rounded-xl bg-[#2D6A4F] py-2 text-xs font-semibold text-white hover:bg-[#1B4332] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <i className="ri-chat-3-line text-xs" />
          <span>{t("nearby.message")}</span>
        </button>
      </div>
    </div>
  );
}
