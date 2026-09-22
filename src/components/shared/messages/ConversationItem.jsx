import Avatar from "../../common/Avatar";
import ImageViewerModal from "../../common/ImageViewerModal";
import { formatTimestamp } from "../../../utils/date";
import { useAuth } from "../../../context/AuthContext";
import { useLanguage } from "../../../context/LanguageContext";
import useProfileViewer from "../../../hooks/useProfileViewer";

import { getTimestampMs } from "../../../utils/chat";

export default function ConversationItem({
  item,
  searching,
  drafts = {},
  activeConversation,
  onConversation,
  onUser,
}) {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const { handleAvatarClick, lightbox, closeLightbox } = useProfileViewer();
  const user = searching ? item : item.otherUser;

  const targetKey = searching ? `user_${user?.uid}` : item.id;
  const draft =
    drafts[targetKey] ||
    (!searching && user?.uid ? drafts[`user_${user.uid}`] : null);
  const hasDraft = Boolean(draft && draft.trim());

  function handleClick() {
    if (searching) {
      onUser(user);
    } else {
      onConversation(item);
    }
  }

  const isSelected =
    !searching &&
    activeConversation &&
    (activeConversation.id === item.id ||
      activeConversation.otherUser?.uid === user?.uid);

  const isMine = !searching && item?.lastMessageSender === profile?.uid;
  const otherUid = user?.uid;
  const otherLastRead = item?.lastRead?.[otherUid];

  const hasUnread = !searching && !isMine && Boolean(item.unreadCount > 0);
  const unreadDisplayCount = item.unreadCount > 99 ? "99+" : item.unreadCount;

  const isSeen = (() => {
    if (!isMine) return false;
    if (otherLastRead && item?.lastMessageAt) {
      const readMs = getTimestampMs(otherLastRead);
      const msgMs = getTimestampMs(item.lastMessageAt);
      return Boolean(readMs && msgMs && readMs >= msgMs);
    }
    return false;
  })();

  return (
    <>
    <button
      onClick={handleClick}
      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-all duration-150 cursor-pointer ${
        isSelected
          ? "bg-(--agri-card)/45 border-r-4 border-agri-primary shadow-xs"
          : "hover:bg-black/3 border-r-4 border-transparent"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar src={user?.profilePicture} name={user?.fullname} onClick={handleAvatarClick(user)} />

        {user?.online && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-(--agri-card)" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3
              className={`truncate ${
                isSelected
                  ? "font-semibold text-agri-dark dark:text-(--agri-brand-light)"
                  : hasUnread
                    ? "font-bold text-(--agri-text)"
                    : "font-semibold text-(--agri-text)"
              }`}
            >
              {user?.fullname}
            </h3>
            {(user?.verificationStatus === "approved" || user?.verified) && (
              <span
                title={t("common.verifiedFarmer")}
                aria-label={t("common.verifiedFarmer")}
                className="inline-flex shrink-0 items-center text-[#2D6A4F] dark:text-(--agri-brand) text-sm"
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}
            {user?.role === "admin" && (
              <span
                title={t("messages.officialAdmin")}
                aria-label={t("messages.officialAdmin")}
                className="inline-flex shrink-0 items-center rounded-md bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/20"
              >
                {t("roles.admin")}
              </span>
            )}
          </div>

          {!searching && (
            <span
              className={`text-xs whitespace-nowrap ${
                hasUnread
                  ? "text-[#2D6A4F] dark:text-(--agri-brand) font-bold"
                  : "text-(--agri-text-muted)"
              }`}
            >
              {formatTimestamp(item.lastMessageAt)}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          {hasDraft ? (
            <p className="text-sm truncate flex-1 min-w-0">
              <span className="text-red-900/75 font-bold">{t("messages.draft")}</span>
              <span className="text-(--agri-text-secondary)">{draft}</span>
            </p>
          ) : searching ? (
            <p className="text-sm text-(--agri-text-muted) truncate flex-1 min-w-0">@{user?.username}</p>
          ) : isMine ? (
            <div className="flex items-center justify-between gap-1.5 min-w-0 flex-1">
              <p className="text-sm text-(--agri-text-muted) truncate flex-1 min-w-0">
                <span className="text-(--agri-text-secondary) font-medium">{t("common.you")}: </span>
                {item.lastMessage || t("messages.sentMessage")}
              </p>
              <span className="shrink-0 flex items-center gap-0.5 text-[11px] font-bold">
                {isSeen ? (
                  <span
                    className="text-(--agri-text-muted) flex items-center gap-0.5"
                    title={t("messages.seen")}
                  >
                    {t("messages.seen")}
                  </span>
                ) : (
                  <span
                    className="text-(--agri-text-muted) flex items-center gap-0.5 font-semibold"
                    title={t("messages.sent")}
                  >
                    {t("messages.sent")}
                  </span>
                )}
              </span>
            </div>
          ) : (
            <p
              className={`text-sm truncate flex-1 min-w-0 ${
                hasUnread ? "font-bold text-(--agri-text)" : "text-(--agri-text-muted)"
              }`}
            >
              {item.lastMessage || t("messages.startConversation")}
            </p>
          )}

          {hasUnread && (
            <span className="min-w-5 h-5 rounded-full bg-[#2D6A4F] text-white text-xs font-bold flex items-center justify-center px-1.5 shrink-0 shadow-xs animate-in fade-in zoom-in-75 duration-150">
              {unreadDisplayCount}
            </span>
          )}
        </div>
      </div>
    </button>
    <ImageViewerModal
      isOpen={Boolean(lightbox)}
      src={lightbox?.src}
      title={lightbox?.title}
      onClose={closeLightbox}
    />
    </>
  );
}
