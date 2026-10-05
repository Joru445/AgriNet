import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import SkeletonBox from "../ui/SkeletonBox";
import { useLanguage } from "../../context/LanguageContext";
import { getGroup, getGroupMemberCount } from "../../services/group.service";
import { isCloudinaryUrl, applyTransform } from "../../utils/cloudinaryTransform";

const PREVIEW_IMG_TF = "w_800,h_400,c_fill,f_auto,q_auto";

export default function GroupPreviewModal({ open, onClose, groupId, initialGroup, farmerId }) {
  const { t } = useLanguage();
  const [group, setGroup] = useState(() => initialGroup || null);
  const [memberCount, setMemberCount] = useState(() => {
    if (typeof initialGroup?.memberCount === "number" && initialGroup.memberCount > 0) {
      return initialGroup.memberCount;
    }
    return farmerId ? 1 : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !groupId) return;

    let cancelled = false;

    // If initialGroup is supplied, hydrate immediately
    if (initialGroup) {
      setGroup((prev) => ({
        ...prev,
        ...initialGroup,
        name: initialGroup.name || initialGroup.groupName || prev?.name,
        imageUrl: initialGroup.imageUrl || initialGroup.groupImageUrl || prev?.imageUrl,
      }));
    }

    async function fetchDetails() {
      try {
        setLoading(true);
        const [groupData, count] = await Promise.all([
          getGroup(groupId),
          getGroupMemberCount(groupId, { farmerId }),
        ]);

        if (!cancelled) {
          if (groupData) {
            setGroup(groupData);
          }
          const resolvedCount = Math.max(
            typeof count === "number" ? count : 0,
            typeof groupData?.memberCount === "number" ? groupData.memberCount : 0,
            Array.isArray(groupData?.members) ? groupData.members.length : 0,
            farmerId ? 1 : 0
          );
          setMemberCount(resolvedCount);
        }
      } catch (err) {
        console.warn("[GroupPreviewModal] Failed to load group details:", err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [open, groupId, initialGroup, farmerId]);

  if (!open || !groupId) return null;

  const groupName = group?.name || group?.groupName || initialGroup?.groupName || "Group";
  const rawImage = group?.imageUrl || group?.groupImageUrl || initialGroup?.groupImageUrl;
  const image =
    !rawImage
      ? null
      : isCloudinaryUrl(rawImage)
        ? applyTransform(rawImage, PREVIEW_IMG_TF)
        : rawImage;

  const displayMemberCount = Math.max(
    memberCount ?? 0,
    group?.memberCount ?? 0,
    initialGroup?.memberCount ?? 0,
    farmerId ? 1 : 0
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      hideTitleBar={true}
      maxWidth="max-w-md"
      panelClassName="relative overflow-hidden rounded-3xl"
      bodyClassName="p-4 sm:p-5"
    >
      <div className="relative">
        {/* Floating close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2.5 top-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md shadow-md transition-all cursor-pointer"
          aria-label={t("common.close") || "Close"}
        >
          <i className="ri-close-line text-lg" />
        </button>

        {/* Top Cover Image / Banner */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#F0F5F2] dark:bg-(--agri-hover) shadow-xs">
          {image ? (
            <img
              src={image}
              alt={groupName}
              width={800}
              height={500}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2D6A4F]/10 via-[#2D6A4F]/5 to-transparent">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D8F3DC] dark:bg-(--agri-brand-bg) text-2xl font-bold text-[#2D6A4F] dark:text-(--agri-brand) shadow-sm ring-1 ring-[#2D6A4F]/20">
                {(groupName || "?")[0]?.toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Group Name & Member count */}
        <div className="mt-4">
          <h3 className="text-xl sm:text-2xl font-bold text-(--agri-text) tracking-tight">
            {groupName}
          </h3>

          <div className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm font-medium text-(--agri-text-muted)">
            <i className="ri-team-line text-[#2D6A4F] dark:text-(--agri-brand)" />
            {loading && memberCount === null && !farmerId ? (
              <SkeletonBox className="h-4 w-20 rounded-md" />
            ) : (
              <span>{t("groups.memberCount", { count: displayMemberCount })}</span>
            )}
          </div>
        </div>

        {/* Description Box */}
        <div className="mt-4 rounded-2xl border border-(--agri-border)/80 bg-(--agri-hover)/40 p-4 sm:p-5 shadow-2xs space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-(--agri-text-muted)">
            {t("groups.description") || "DESCRIPTION"}
          </h4>
          {loading && !group?.description ? (
            <div className="space-y-2 pt-1 pb-0.5" aria-label="Loading description">
              <SkeletonBox className="h-3.5 w-full rounded-md" />
              <SkeletonBox className="h-3.5 w-5/6 rounded-md" />
              <SkeletonBox className="h-3.5 w-2/3 rounded-md" />
            </div>
          ) : (
            <p className="text-xs sm:text-sm leading-relaxed text-(--agri-text-secondary) break-words whitespace-pre-line">
              {group?.description || t("groups.noDescription") || "No description provided."}
            </p>
          )}
        </div>

        {/* Actions Footer */}
        <div className="mt-5 flex items-center justify-end pt-3 border-t border-(--agri-border-subtle)">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-(--agri-hover) hover:bg-(--agri-border)/60 text-(--agri-text) font-semibold text-xs sm:text-sm px-5 py-2.5 transition-colors cursor-pointer border border-(--agri-border)/80 shadow-2xs"
          >
            {t("common.close") || "Close"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
