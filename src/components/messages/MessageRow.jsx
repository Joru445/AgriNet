import { auth } from "../../firebase/auth";
import Avatar from "../ui/Avatar";
import ImageViewerModal from "../ui/ImageViewerModal";
import MessageBubble from "./MessageBubble";
import MessageReplyButton from "./MessageReplyButton";
import useSwipeToReply, { prefersReducedMotion } from "../../hooks/useSwipeToReply";
import { buildReplySnapshot } from "../../utils/messageReply";
import useProfileViewer from "../../hooks/useProfileViewer";

const REVEAL_WIDTH = 72;

export default function MessageRow({
  message,
  groupPosition = "single",
  user,
  profile,
  messages = [],
  isHighlighted = false,
  statusText = null,
  onReply,
  onJumpToMessage,
  onRetry,
  onDeleteFailed,
  onStopLiveLocation,
}) {
  const currentUid = profile?.uid || auth.currentUser?.uid;
  const mine = Boolean(
    currentUid &&
    (message.senderId === currentUid || message.sender?.uid === currentUid)
  );
  const reducedMotion = prefersReducedMotion();
  const { handleAvatarClick, lightbox, closeLightbox } = useProfileViewer();

  // Messenger gesture: Received messages swipe right, sent messages swipe left towards center
  const swipeDirection = mine ? "left" : "right";
  const swipe = useSwipeToReply({
    enabled: Boolean(onReply),
    direction: swipeDirection,
    onReply: () => triggerReply(),
  });

  const isSwiping = swipe.dragging || swipe.offset !== 0;
  const revealProgress = Math.min(Math.abs(swipe.offset) / REVEAL_WIDTH, 1);

  const triggerReply = () => {
    if (onReply) onReply(buildReplySnapshot({ message, user, currentUserId: currentUid }));
  };

  const showAvatar = !mine && (groupPosition === "single" || groupPosition === "last");
  const avatarVisibility = !mine && !showAvatar ? "invisible" : "";

  const isGrouped = groupPosition === "middle" || groupPosition === "last";
  const groupSpacing = isGrouped
    ? mine
      ? "-mt-3 pt-0.5"
      : "-mt-3 sm:-mt-3.5 pt-0.5"
    : "";

  const swipeStyle = {
    transform:
      swipe.offset !== 0
        ? `translate3d(${swipe.offset}px, 0, 0)`
        : undefined,
    touchAction: "pan-y",
    userSelect: swipe.dragging ? "none" : undefined,
    WebkitUserSelect: swipe.dragging ? "none" : undefined,
    transition:
      swipe.dragging || reducedMotion
        ? "none"
        : "transform 220ms cubic-bezier(0.2, 0, 0, 1)",
  };

  // --- E2E: Resolve reply content from loaded messages ---
  const resolvedReplyTo = (() => {
    // Legacy: replyToSnapshot stored plaintext (backward compat)
    if (message.replyToSnapshot) return message.replyToSnapshot;

    // E2E: replyTo is a message ID — resolve from loaded messages
    if (message.replyTo && typeof message.replyTo === "string") {
      const referencedMsg = messages.find((m) => m.id === message.replyTo);
      if (referencedMsg) {
        return {
          messageId: referencedMsg.id,
          senderId: referencedMsg.senderId,
          type: referencedMsg.type || "text",
          textSnapshot: referencedMsg.text || "",
          imageUrl: referencedMsg.imageUrl || null,
          productId: referencedMsg.productId || null,
          quantity: referencedMsg.quantity ?? null,
          inquiryStatus: referencedMsg.inquiryStatus || null,
        };
      }
      // Referenced message not loaded — show fallback
      return { messageId: message.replyTo, type: "text", textSnapshot: null };
    }

    return null;
  })();

  const isLocationMsg =
    message.type === "live_location" ||
    message.type === "location" ||
    message.locationType === "live_location" ||
    message.locationType === "location" ||
    Boolean(message.location);

  return (
    <>
    <div
      data-message-id={message.id}
      className={`group/swipe relative flex w-full min-w-0 scroll-mt-6 scroll-mb-6 ${mine ? "justify-end" : "justify-start"} ${groupSpacing}`}
    >
      <div
        className={`relative flex min-w-0 ${
          isLocationMsg
            ? "max-w-[95%] sm:max-w-[85%] md:max-w-[75%]"
            : "max-w-[85%] sm:max-w-[75%] md:max-w-[68%] lg:max-w-[62%]"
        } ${mine ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Reply Action Affordance */}
        {Boolean(onReply) && (
          <ReplyAffordance
            mine={mine}
            revealProgress={revealProgress}
            isSwiping={isSwiping}
            onReply={triggerReply}
          />
        )}

        {/* Message Content Container */}
        <div className="relative z-10 min-w-0 flex-1">
          {/* Swipe-translated portion: avatar + bubble. */}
          <div
            className={`flex min-w-0 items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
            {...swipe.bind}
            style={swipeStyle}
          >
            {!mine && (
              <Avatar
                src={user?.profilePicture}
                name={user?.fullname}
                size="sm"
                className={`flex shrink-0 mb-1 ${avatarVisibility}`}
                onClick={handleAvatarClick(user)}
              />
            )}

            <div className={`flex flex-col min-w-0 max-w-full ${mine ? "items-end" : "items-start"}`}>
              <MessageBubble
                message={message}
                mine={mine}
                user={user}
                profile={profile}
                groupPosition={groupPosition}
                isHighlighted={isHighlighted}
                resolvedReplyTo={resolvedReplyTo}
                onRetry={onRetry}
                onDeleteFailed={onDeleteFailed}
                onJumpToMessage={onJumpToMessage}
                onStopLiveLocation={onStopLiveLocation}
              />

              {statusText && (
                <span className="text-[11px] text-(--agri-text-muted) font-normal px-1 mt-1 select-none leading-none">
                  {statusText}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    <ImageViewerModal
      isOpen={Boolean(lightbox)}
      src={lightbox?.src}
      title={lightbox?.title}
      onClose={closeLightbox}
    />
    </>
  );
}

function ReplyAffordance({ mine, revealProgress, isSwiping, onReply }) {
  return (
    <>
      {/* Swipe reveal indicator: shown during active swipe/drag gesture */}
      {isSwiping && revealProgress > 0 && (
        <div
          className={[
            "pointer-events-none absolute inset-y-0 z-0 flex items-center transition-all duration-75",
            mine ? "right-1 sm:right-2" : "left-1 sm:left-2",
          ].join(" ")}
          style={{
            opacity: revealProgress,
            transform: `scale(${0.4 + revealProgress * 0.6})`,
          }}
        >
          <MessageReplyButton onClick={onReply} className="cursor-default" />
        </div>
      )}

      {/* Desktop / PC hover reply button: visible on mouse hover */}
      {!isSwiping && (
        <div
          className={[
            "absolute inset-y-0 z-20 flex items-center opacity-0 transition-opacity duration-150 pointer-events-none group-hover/swipe:opacity-100 group-hover/swipe:pointer-events-auto focus-within:opacity-100 focus-within:pointer-events-auto",
            mine ? "-left-10 sm:-left-11" : "-right-10 sm:-right-11",
          ].join(" ")}
        >
          <MessageReplyButton onClick={onReply} />
        </div>
      )}
    </>
  );
}