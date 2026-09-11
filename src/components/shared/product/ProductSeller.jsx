import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../../common/Avatar";
import ImageViewerModal from "../../common/ImageViewerModal";
import { useLanguage } from "../../../context/LanguageContext";
import useProfileViewer from "../../../hooks/useProfileViewer";

export default function ProductSeller({ farmer, isOwner }) {
  const { t } = useLanguage();
  const [expandedAddress, setExpandedAddress] = useState(false);
  const { handleAvatarClick, lightbox, closeLightbox } = useProfileViewer();

  if (!farmer) return null;

  const farmerName =
    farmer.fullname || farmer.storeName || farmer.username || t("productDetails.farmerFallback");
  const farmerAvatar = farmer.profilePicture || "";
  const farmerId = farmer.uid || farmer.id;
  const address = farmer.location?.address || farmer.address || "";
  const isLongAddress = address.length > 28;

  if (isOwner || !farmerId) return null;

  return (
    <>
    <section className="mx-4 sm:mx-6 mt-4 sm:mt-5 rounded-xl border border-[var(--agri-border-subtle)] bg-[var(--agri-hover)] p-4">
      <div className="flex items-center gap-3.5">
        <Link to={`/profile/${farmerId}`} className="shrink-0">
          <Avatar
            src={farmerAvatar}
            name={farmerName}
            className="w-11 h-11"
            onClick={handleAvatarClick(farmer)}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link
              to={`/profile/${farmerId}`}
              className="font-semibold text-sm sm:text-base text-[var(--agri-text)] hover:underline truncate"
            >
              {farmerName}
            </Link>
            {(farmer.verificationStatus === "approved" || farmer.verified) && (
              <span
                title={t("productSeller.verifiedFarmer")}
                aria-label={t("productSeller.verifiedFarmer")}
                className="inline-flex shrink-0 items-center text-[#2D6A4F] text-sm"
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}
          </div>

          {address && (
            <div className="mt-0.5 flex items-start gap-1 text-xs text-[var(--agri-text-muted)]">
              <i className="ri-map-pin-line shrink-0 mt-0.5" />
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
          )}
        </div>

        <Link
          to={`/profile/${farmerId}`}
          className="shrink-0 rounded-lg border border-[var(--agri-border)] bg-[var(--agri-card)] px-3 py-1.5 text-xs font-semibold text-[var(--agri-text-secondary)] hover:bg-[var(--agri-hover)] hover:text-[var(--agri-text)] transition-colors"
        >
          {t("productSeller.visitStore")}
        </Link>
      </div>
    </section>
    <ImageViewerModal
      isOpen={Boolean(lightbox)}
      src={lightbox?.src}
      title={lightbox?.title}
      onClose={closeLightbox}
    />
    </>
  );
}
