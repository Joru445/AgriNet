import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../../common/Avatar";
import { useLanguage } from "../../../context/LanguageContext";

export default function ProductSeller({ farmer, isOwner }) {
  const { t } = useLanguage();
  const [expandedAddress, setExpandedAddress] = useState(false);

  if (!farmer) return null;

  const farmerName =
    farmer.fullname || farmer.storeName || farmer.username || t("productDetails.farmerFallback");
  const farmerAvatar = farmer.profilePicture || "";
  const farmerId = farmer.uid || farmer.id;
  const address = farmer.location?.address || farmer.address || "";
  const isLongAddress = address.length > 28;

  return (
    !isOwner &&
    farmerId && (
      <section className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-card)] p-5">
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
          <Avatar
            src={farmerAvatar}
            name={farmerName}
            className="shrink-0 mt-0.5 sm:mt-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg text-[var(--agri-text)] truncate">
                {farmerName}
              </h3>
              {farmer.verified && (
                <span
                  title={t("productSeller.verifiedFarmer")}
                  aria-label={t("productSeller.verifiedFarmer")}
                  className="inline-flex shrink-0 items-center text-[#2D6A4F] text-base"
                >
                  <i className="ri-verified-badge-fill" />
                </span>
              )}
            </div>

            <div className="mt-1 text-xs sm:text-sm text-[var(--agri-text-muted)]">
              <div className="flex items-start gap-1">
                <i className="ri-map-pin-line shrink-0 text-[var(--agri-text-muted)] mt-0.5" />
                <div className="min-w-0 flex-1 leading-snug">
                  <span
                    className={
                      !expandedAddress && isLongAddress
                        ? "line-clamp-1 break-words"
                        : "break-words"
                    }
                  >
                    {address}
                  </span>
                  {isLongAddress && (
                    <button
                      type="button"
                      onClick={() => setExpandedAddress((prev) => !prev)}
                      className="mt-0.5 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] hover:underline cursor-pointer inline-flex items-center gap-0.5 transition-colors"
                    >
                      {expandedAddress ? t("productSeller.seeLess") : t("productSeller.seeMore")}
                      <i
                        className={`text-xs ${
                          expandedAddress
                            ? "ri-arrow-up-s-line"
                            : "ri-arrow-down-s-line"
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Link
            to={`/profile/${farmerId}`}
            className="shrink-0 rounded-xl border border-[var(--agri-border)] bg-transparent px-3.5 py-2 text-xs sm:text-sm font-semibold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] hover:text-[var(--agri-text)] transition-colors cursor-pointer"
          >
            {t("productSeller.visitStore")}
          </Link>
        </div>
      </section>
    )
  );
}
