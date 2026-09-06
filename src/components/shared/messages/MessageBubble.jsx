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
  groupPosition = "single",
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

  return (
    <div
      className={`min-w-0 rounded-2xl select-none flex flex-col
        ${isImage ? "overflow-hidden" : ""}
        ${
          isFailed
            ? "bg-red-50 dark:bg-red-500/10 text-red-900 dark:text-red-300 border border-red-300 dark:border-red-500/30 shadow-sm"
            : ""
        }`}
    >
      {/* Reply quote */}
      {replyTo && (
        <button
          type="button"
          onClick={() => onJumpToMessage?.(replyTo.messageId)}
          className={`block w-full text-left pt-2.5 pb-1 cursor-pointer ${mine ? "pl-4" : "pr-4"}`}
          aria-label={t("messages.replyToLabel")}
        >
          <span
            className={`flex min-w-0 items-center rounded-2xl px-3 py-2 shadow-black/10
              ${
                mine
                  ? "bg-(--agri-elevated) dark:bg-(--agri-elevated) text-(--agri-text) border border-(--agri-border)"
                  : "bg-(--agri-hover) border-[#2D6A4F] dark:border-(--agri-brand)"
              }
            `}
          >
            <MessageReplyContent replyTo={replyTo} />
          </span>
        </button>
      )}

      {message.text && (
        <p
          className={`break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap px-4 py-1 shadow-md ${textRadius}
            ${isImage ? "text-sm font-medium" : ""}
            ${replyTo ? "pt-1" : ""}
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
        <div className="rounded-xl overflow-hidden mb-0 group relative">
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
