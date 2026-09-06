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
  onReply,
  onJumpToMessage,
  onRetry,
  onDeleteFailed,
}) {
  const mine = message.senderId === profile?.uid;
  const isTouch = useIsTouch();
  const reducedMotion = prefersReducedMotion();

  const swipeDirection = mine ? "left" : "right";
  const swipe = useSwipeToReply({
    enabled: isTouch,
    direction: swipeDirection,
    onReply: () => triggerReply(),
  });

  const revealProgress = Math.min(Math.abs(swipe.offset) / REVEAL_WIDTH, 1);

  const triggerReply = () => {
    if (onReply) onReply(buildReplySnapshot({ message, user, currentUserId: profile?.uid }));
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
    transform: swipe.offset ? `translate3d(${swipe.offset}px,0,0)` : undefined,
    touchAction: "pan-y",
    transition: swipe.dragging || reducedMotion ? "none" : "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
  };

  return (
    <div
      data-message-id={message.id}
      className={`flex flex-col min-w-0 rounded-2xl transition-colors ${groupSpacing} ${
        isHighlighted ? "bg-gray-200/60 dark:bg-gray-500/20" : ""
      }`}
    >
      <div
        className={`relative flex items-center ${mine ? "justify-end" : "justify-start"} min-w-0 w-full group`}
      >
        <div className="group/swipe relative z-9995 flex min-w-0 max-w-[85%] sm:max-w-[75%] w-fit items-center">
          <ReplyAffordance
            mine={mine}
            isTouch={isTouch}
            revealProgress={revealProgress}
            onReply={triggerReply}
          />

          {/* Swipe-translated portion: avatar + bubble. */}
          <div
            className="flex min-w-0 items-start gap-2"
            {...swipe.bind}
            style={swipeStyle}
          >
            {!mine && (
              <Avatar
                src={user?.profilePicture}
                name={user?.fullname}
                size="sm"
                className={`flex shrink-0 ${message.replyTo ? "mt-16" : ""} ${avatarVisibility}`}
              />
            )}

            <MessageBubble
              message={message}
              mine={mine}
              groupPosition={groupPosition}
              onRetry={onRetry}
              onDeleteFailed={onDeleteFailed}
              onJumpToMessage={onJumpToMessage}
            />
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