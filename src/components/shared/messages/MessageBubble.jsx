import { useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import ImageViewerModal from "../../common/ImageViewerModal";
import MessageImage from "./MessageImage";
import MessageLinkPreview from "./MessageLinkPreview";
import MessageReplyContent from "./MessageReplyContent";
import { extractFirstUrl } from "../../../utils/linkPreview";
import {
  applyTransform,
  MESSAGE_IMG_TF,
  isCloudinaryUrl,
} from "../../../utils/cloudinaryTransform";

export default function MessageBubble({
  message,
  mine = false,
  user,
  profile,
  groupPosition = "single",
  isHighlighted = false,
  onRetry,
  onDeleteFailed,
  onJumpToMessage,
}) {
  const { t } = useLanguage();
  const [showLightbox, setShowLightbox] = useState(false);

  const isFailed = message.status === "failed";
  const isImage = message.type === "image" || Boolean(message.imageUrl);

  const replyTo =
    message.replyToSnapshot ||
    (message.replyTo && typeof message.replyTo === "object"
      ? message.replyTo
      : null);
  const messageUrl = extractFirstUrl(message.text);
  const showLinkPreview = Boolean(messageUrl && !isImage);

  const textRadius =
    {
      mine: {
        single: "rounded-2xl",
        first: "rounded-t-2xl rounded-bl-2xl rounded-br-sm",
        middle: "rounded-tl-2xl rounded-bl-2xl rounded-tr-sm rounded-br-sm",
        last: "rounded-tl-2xl rounded-bl-2xl rounded-tr-sm rounded-br-2xl",
      },
      other: {
        single: "rounded-2xl",
        first: "rounded-t-2xl rounded-br-2xl rounded-bl-sm",
        middle: "rounded-tr-2xl rounded-br-2xl rounded-tl-sm rounded-bl-sm",
        last: "rounded-tr-2xl rounded-br-2xl rounded-tl-sm rounded-bl-2xl",
      },
    }[mine ? "mine" : "other"][groupPosition] || "rounded-2xl";

  const otherUserName = user?.fullname || user?.username || message.senderName || "";
  const isSelfReply = mine
    ? replyTo?.senderId === profile?.uid ||
      Boolean(profile?.fullname && replyTo?.senderName === profile?.fullname)
    : Boolean(
        (user?.uid && replyTo?.senderId === user.uid) ||
        (user?.id && replyTo?.senderId === user.id) ||
        (otherUserName && replyTo?.senderName === otherUserName),
      );

  // Reply indication header should ONLY be shown when replying to the other user ("the user who chat me")
  const showReplyHeader = Boolean(replyTo && !isSelfReply);

  const targetReplyName =
    (mine ? otherUserName : null) ||
    replyTo?.senderName ||
    otherUserName ||
    t("messages.replyToMessage");

  return (
    <div
      className={`min-w-0 select-none flex flex-col ${mine ? "items-end" : "items-start"}
        ${isImage ? "overflow-hidden" : ""}
        ${
          isFailed
            ? "bg-red-50 dark:bg-red-500/10 text-red-900 dark:text-red-300 border border-red-300 dark:border-red-500/30 shadow-sm"
            : ""
        }`}
    >
      {/* Reply quote */}
      {replyTo && (
        <div className={`flex flex-col ${mine ? "items-end" : "items-start"} max-w-full mb-1`}>
          {/* Subtle header: ↩ You replied to Name (when mine) / ↩ Name replied to you (when other) */}
          {showReplyHeader && (
            <button
              type="button"
              onClick={() => onJumpToMessage?.(replyTo.messageId || replyTo.id)}
              className="flex items-center gap-1 text-[11px] text-[var(--agri-text-muted)] hover:text-[var(--agri-text)] font-medium mb-1 px-1 select-none cursor-pointer transition"
              aria-label={t("messages.replyToLabel")}
            >
              <i className="ri-reply-line text-xs" />
              <span>
                {mine
                  ? t("messages.youRepliedTo", { name: targetReplyName })
                  : t("messages.repliedToYou", { name: otherUserName || targetReplyName })}
              </span>
            </button>
          )}

          {/* Quote bubble: clean pill, NO icon, NO name inside, just quoted text */}
          <button
            type="button"
            onClick={() => onJumpToMessage?.(replyTo.messageId || replyTo.id)}
            className={`flex items-center gap-2 rounded-2xl px-3 py-1.5 text-xs text-left cursor-pointer transition hover:opacity-85 max-w-full w-fit shadow-xs
              ${
                mine
                  ? "bg-black/10 dark:bg-white/10 text-[var(--agri-text)] border border-black/5 dark:border-white/5"
                  : "bg-[var(--agri-hover)] text-[var(--agri-text-muted)] border border-[var(--agri-border)]"
              }
            `}
            aria-label={t("messages.replyToLabel")}
          >
            <MessageReplyContent replyTo={replyTo} />
          </button>
        </div>
      )}

      {message.text && (
        <p
          className={`w-fit max-w-full break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap px-4 py-2 shadow-md ${textRadius}
            ${isImage ? "text-sm font-medium" : ""}
            ${isHighlighted ? "animate-reply-flash ring-2 ring-[#2D6A4F]/40 dark:ring-[var(--agri-brand)]/40" : ""}
            ${
              mine
                ? "bg-[#2D6A4F] text-white shadow-green-900/20"
                : "bg-(--agri-elevated) text-(--agri-text) border border-(--agri-border) shadow-black/10"
            }
          `}
        >
          {message.text}
        </p>
      )}

      {showLinkPreview && (
        <div className="px-1.5 pb-1 first:pt-1">
          <MessageLinkPreview url={messageUrl} metadata={message.linkPreview} />
        </div>
      )}

      {/* Image Attachment */}
      {isImage && message.imageUrl && (
        <div className={`rounded-xl overflow-hidden mb-0 group relative ${isHighlighted ? "animate-reply-flash ring-2 ring-[#2D6A4F]/40 dark:ring-[var(--agri-brand)]/40" : ""}`}>
          <MessageImage
            src={
              isCloudinaryUrl(message.imageUrl)
                ? applyTransform(message.imageUrl, MESSAGE_IMG_TF)
                : message.imageUrl
            }
            alt={t("messages.photoAttachment")}
            onLightbox={() => setShowLightbox(true)}
            className="max-h-72"
            imageClassName="transition hover:opacity-95"
          />
          <button
            type="button"
            onClick={() => setShowLightbox(true)}
            className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition shadow-md cursor-pointer"
            title={t("messages.viewFullImage")}
          >
            <i className="ri-fullscreen-line text-sm" />
          </button>
        </div>
      )}

      {/* Failed indicator */}
      {isFailed && (
        <div className="flex items-center gap-1.5 mt-1 mr-1 text-xs text-red-600 font-semibold select-none">
          <i className="ri-error-warning-fill text-sm text-red-500" />
          <span>{t("messages.couldntSend")}</span>
          <button
            type="button"
            onClick={() => onRetry?.(message)}
            className="text-red-700 hover:text-red-900 underline font-bold cursor-pointer ml-1"
          >
            {t("messages.tapToRetry")}
          </button>
          {onDeleteFailed && (
            <button
              type="button"
              onClick={() => onDeleteFailed?.(message.id)}
              className="text-(--agri-text-muted) hover:text-red-600 transition cursor-pointer ml-1 p-0.5"
              title={t("messages.deleteFailedMessage")}
            >
              <i className="ri-close-line text-sm" />
            </button>
          )}
        </div>
      )}

      {/* Zoomable Lightbox / Fullscreen Image Modal */}
      <ImageViewerModal
        isOpen={showLightbox && Boolean(message.imageUrl)}
        src={message.imageUrl}
        alt={t("messages.messagePhoto")}
        title={t("messages.photo")}
        onClose={() => setShowLightbox(false)}
      />
    </div>
  );
}
