import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import Avatar from "../../common/Avatar";
import ImageViewerModal from "../../common/ImageViewerModal";

export default function MessageBubble({
  user,
  message,
  isLastMine = false,
  isSeen = false,
  onRetry,
  onDeleteFailed,
}) {
  const { profile } = useAuth();
  const [showLightbox, setShowLightbox] = useState(false);

  const mine = message.senderId === profile.uid;
  const isFailed = message.status === "failed";
  const isImage = message.type === "image" || Boolean(message.imageUrl);

  return (
    <div
      className={`flex flex-col ${mine ? "items-end" : "items-start"} min-w-0`}
    >
      <div
        className={`flex gap-2 ${mine ? "justify-end" : "justify-start"} min-w-0 w-full`}
      >
        <Avatar
          src={user?.profilePicture}
          name={user?.fullname}
          size="sm"
          className={`${mine ? "hidden" : "flex shrink-0"}`}
        />
        <div
          className={`max-w-[85%] sm:max-w-[75%] min-w-0 rounded-2xl
          ${isImage ? "overflow-hidden" : ""
            }
          ${isFailed
              ? "bg-red-50 text-red-900 border border-red-300 shadow-sm"
              : ""
            }`}
        >
          {message.text && (
            <p
              className={`break-words [overflow-wrap:anywhere] [word-break:break-word] whitespace-pre-wrap px-4 py-2.5 rounded-2xl shadow-md
                ${isImage ? "text-sm font-medium" : ""}
                ${mine
                  ? "bg-[#2D6A4F] text-white shadow-green-900/20"
                  : "bg-white text-gray-800 border-gray-200 shadow-black/10"
                }
              `}
            >
              {message.text}
            </p>
          )}

          {/* Image Attachment */}
          {isImage && message.imageUrl && (
            <div className={`rounded-xl overflow-hidden mb-0 group relative ${mine ? "justify-self-end" : "justify-self-start"}`}>
              <img
                src={message.imageUrl}
                alt="Photo attachment"
                onClick={() => setShowLightbox(true)}
                className="max-h-72 w-auto max-w-full rounded-xl object-cover cursor-pointer transition hover:opacity-95"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => setShowLightbox(true)}
                className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition shadow-md cursor-pointer"
                title="View full image"
              >
                <i className="ri-fullscreen-line text-sm" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Failed indicator */}
      {isFailed && (
        <div className="flex items-center gap-1.5 mt-1 mr-1 text-xs text-red-600 font-semibold select-none">
          <i className="ri-error-warning-fill text-sm text-red-500" />
          <span>Couldn't send.</span>
          <button
            type="button"
            onClick={() => onRetry?.(message)}
            className="text-red-700 hover:text-red-900 underline font-bold cursor-pointer ml-1"
          >
            Tap to retry
          </button>
          {onDeleteFailed && (
            <button
              type="button"
              onClick={() => onDeleteFailed?.(message.id)}
              className="text-gray-400 hover:text-red-600 transition cursor-pointer ml-1 p-0.5"
              title="Delete failed message"
            >
              <i className="ri-close-line text-sm" />
            </button>
          )}
        </div>
      )}

      {/* Sent / Seen indicator for sender */}
      {mine && !isFailed && isLastMine && (
        <div className="flex items-center justify-end gap-1 mt-1 mr-1 text-[11px] font-bold select-none transition-all">
          {isSeen ? (
            <span className="flex items-center gap-1 text-gray-400">Seen</span>
          ) : (
            <span className="flex items-center gap-1 text-gray-400 font-semibold">
              Sent
            </span>
          )}
        </div>
      )}

      {/* Zoomable Lightbox / Fullscreen Image Modal */}
      <ImageViewerModal
        isOpen={showLightbox && Boolean(message.imageUrl)}
        src={message.imageUrl}
        alt="Message photo"
        title="Photo"
        onClose={() => setShowLightbox(false)}
      />
    </div>
  );
}
