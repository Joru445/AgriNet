import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar";
import GroupBadge from "../groups/GroupBadge";
import GroupPreviewModal from "../groups/GroupPreviewModal";
import ImageViewerModal from "../ui/ImageViewerModal";
import { useLanguage } from "../../context/LanguageContext";
import useProfileViewer from "../../hooks/useProfileViewer";
import { getUserApprovedGroups } from "../../services/group.service";
import * as pageCache from "../../utils/pageCache";

export default function ProductSeller({ farmer, product, isOwner }) {
  const { t } = useLanguage();
  const [expandedAddress, setExpandedAddress] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { handleAvatarClick, lightbox, closeLightbox } = useProfileViewer();

  const farmerId = farmer?.uid || farmer?.id;
  const [groups, setGroups] = useState(() => {
    if (!farmerId) return [];
    if (Array.isArray(farmer?.groups) && farmer.groups.length > 0) return farmer.groups;
    if (farmer?.group) return [farmer.group];
    if (Array.isArray(product?.groups) && product.groups.length > 0) return product.groups;
    if (product?.group) return [product.group];
    const cached = pageCache.get(`approvedUserGroups:${farmerId}`);
    return Array.isArray(cached) ? cached : [];
  });

  useEffect(() => {
    if (!farmerId) return;
    let cancelled = false;

    getUserApprovedGroups(farmerId)
      .then((approvedGroups) => {
        if (!cancelled && Array.isArray(approvedGroups)) {
          setGroups(approvedGroups);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [farmerId]);

  if (!farmer || isOwner || !farmerId) return null;

  const farmerName =
    farmer.fullname || farmer.storeName || farmer.username || t("productDetails.farmerFallback");
  const farmerAvatar = farmer.profilePicture || "";
  const address = farmer.location?.address || farmer.address || "";
  const isLongAddress = address.length > 28;

  return (
    <>
      <section className="mx-4 sm:mx-6 mt-4 sm:mt-5 rounded-xl border border-(--agri-border-subtle) bg-(--agri-hover) p-4">
        {/* Top row: Avatar + Farmer Info on left, Visit Store button on right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to={`/profile/${farmerId}`} className="shrink-0">
              <Avatar
                src={farmerAvatar}
                name={farmerName}
                className="w-11 h-11"
                onClick={handleAvatarClick(farmer)}
              />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <Link
                  to={`/profile/${farmerId}`}
                  className="font-semibold text-sm sm:text-base text-(--agri-text) hover:underline truncate"
                >
                  {farmerName}
                </Link>
                {(farmer.verificationStatus === "approved" || farmer.verified) && (
                  <span
                    title={t("productSeller.verifiedFarmer")}
                    aria-label={t("productSeller.verifiedFarmer")}
                    className="inline-flex shrink-0 items-center text-(--agri-green-mid) dark:text-(--agri-brand) text-sm"
                  >
                    <i className="ri-verified-badge-fill" />
                  </span>
                )}
                {groups.map((g) => (
                  <GroupBadge
                    key={g.groupId}
                    groupId={g.groupId}
                    groupName={g.groupName}
                    groupImageUrl={g.groupImageUrl}
                    size="xs"
                    onClick={() => setSelectedGroup(g)}
                  />
                ))}
              </div>
            </div>
          </div>

          <Link
            to={`/profile/${farmerId}`}
            className="shrink-0 rounded-lg border border-(--agri-border) bg-(--agri-card) px-3 py-1.5 text-xs font-semibold text-(--agri-text-secondary) hover:bg-(--agri-hover) hover:text-(--agri-text) transition-colors whitespace-nowrap"
          >
            {t("productSeller.visitStore")}
          </Link>
        </div>

        {/* Address row: spans full width below top row to prevent vertical squishing */}
        {address && (
          <div className="mt-2.5 pt-2 border-t border-(--agri-border-subtle) flex items-start gap-1.5 text-xs text-(--agri-text-muted)">
            <i className="ri-map-pin-line shrink-0 mt-0.5 text-xs text-(--agri-text-muted)" />
            <div className="min-w-0 flex-1 leading-snug">
              <span
                className={
                  !expandedAddress && isLongAddress
                    ? "line-clamp-2 break-words"
                    : "break-words"
                }
              >
                {address}
              </span>
              {isLongAddress && (
                <button
                  type="button"
                  onClick={() => setExpandedAddress((prev) => !prev)}
                  className="ml-1 text-xs font-bold text-(--agri-green-mid) dark:text-(--agri-brand) hover:text-(--agri-green-dark) dark:hover:text-(--agri-brand-light) hover:underline cursor-pointer inline-flex items-center gap-0.5 transition-colors"
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
      </section>

      <ImageViewerModal
        isOpen={Boolean(lightbox)}
        src={lightbox?.src}
        title={lightbox?.title}
        onClose={closeLightbox}
      />

      {selectedGroup && (
        <GroupPreviewModal
          open={Boolean(selectedGroup)}
          onClose={() => setSelectedGroup(null)}
          groupId={selectedGroup.groupId}
          initialGroup={selectedGroup}
          farmerId={farmerId}
        />
      )}
    </>
  );
}
