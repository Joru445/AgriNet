import { useEffect, useState } from "react";
import Avatar from "../../common/Avatar";
import MessageBubble from "./MessageBubble";
import MessageReplyButton from "./MessageReplyButton";
import useSwipeToReply, { prefersReducedMotion } from "../../../hooks/useSwipeToReply";
import { buildReplySnapshot } from "../../../utils/messageReply";

const REVEAL_WIDTH = 72;

function useIsTouch() {
  const [isTouch, setIsTouch] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches,
  );

  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    const update = () => setIsTouch(mql.matches);
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  return isTouch;
}

export default function MessageRow({
  message,
  groupPosition = "single",
  user,
  profile,
  isHighlighted = false,
  statusText = null,
  onReply,
  onJumpToMessage,
  onRetry,
  onDeleteFailed,
}) {
  const mine = message.senderId === profile?.uid;
  const isTouch = useIsTouch();
  const reducedMotion = prefersReducedMotion();

  // Allow replying only to the other user ("the user who chat me")
  const canReply = !mine;
  const swipeDirection = "right";
  const swipe = useSwipeToReply({
    enabled: isTouch && canReply,
    direction: swipeDirection,
    onReply: () => triggerReply(),
  });

  const revealProgress = Math.min(Math.abs(swipe.offset) / REVEAL_WIDTH, 1);

  const triggerReply = () => {
    if (onReply && canReply) onReply(buildReplySnapshot({ message, user, currentUserId: profile?.uid }));
  };

  const showAvatar = !mine && (groupPosition === "single" || groupPosition === "last");
  const avatarVisibility = !mine && !showAvatar ? "invisible" : "";

  const isGrouped = groupPosition === "middle" || groupPosition === "last";
  const groupSpacing = isGrouped
    ? mine
      ? "-mt-3 pt-0.5"
      : "-mt-4.5 pt-0.5"
    : "";

  const swipeStyle = {
    transform:
      swipe.offset !== 0
        ? `translateX(${swipe.offset}px)`
        : undefined,
    transition:
      swipe.dragging || reducedMotion
        ? "none"
        : "transform 200ms cubic-bezier(0.2, 0, 0, 1)",
  };

  return (
    <div
      data-message-id={message.id}
      className={`group/swipe relative flex w-full min-w-0 scroll-mt-6 scroll-mb-6 ${mine ? "justify-end" : "justify-start"} ${groupSpacing}`}
    >
      <div
        className={`relative flex min-w-0 max-w-[85%] sm:max-w-[75%] md:max-w-[68%] lg:max-w-[62%] ${
          mine ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Reply Action Affordance - only for messages from the other user */}
        {canReply && (
          <ReplyAffordance
            mine={mine}
            isTouch={isTouch}
            revealProgress={revealProgress}
            onReply={triggerReply}
          />
        )}

        {/* Message Content Container */}
        <div className="relative min-w-0 flex-1">
          {/* Swipe-translated portion: avatar + bubble. */}
          <div
            className="flex min-w-0 items-end gap-2"
            {...swipe.bind}
            style={swipeStyle}
          >
            {!mine && (
              <Avatar
                src={user?.profilePicture}
                name={user?.fullname}
                size="sm"
                className={`flex shrink-0 mb-1 ${avatarVisibility}`}
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
                onRetry={onRetry}
                onDeleteFailed={onDeleteFailed}
                onJumpToMessage={onJumpToMessage}
              />

              {statusText && (
                <span className="text-[11px] text-[var(--agri-text-muted)] font-normal px-1 mt-1 select-none leading-none">
                  {statusText}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplyAffordance({ mine, isTouch, revealProgress, onReply }) {
  if (isTouch) {
    return (
      <div
        className={[
          "pointer-events-none absolute inset-y-0 z-0 flex items-center",
          mine ? "left-0" : "right-0",
        ].join(" ")}
        style={{ opacity: revealProgress }}
      >
        <MessageReplyButton onClick={onReply} className="cursor-default" />
      </div>
    );
  }

  return (
    <div
      className={[
        "absolute inset-y-0 z-0 flex items-center opacity-0 transition-opacity group-hover/swipe:opacity-100 focus-within:opacity-100",
        mine ? "-left-11" : "-right-11",
      ].join(" ")}
    >
      <MessageReplyButton onClick={onReply} />
    </div>
  );
}