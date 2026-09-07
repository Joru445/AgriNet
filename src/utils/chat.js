export function parseTimestamp(timestamp) {
  if (!timestamp) return null;

  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }

  if (timestamp.seconds != null) {
    return new Date(timestamp.seconds * 1000);
  }

  if (timestamp instanceof Date) {
    return timestamp;
  }

  const d = new Date(timestamp);
  return isNaN(d.getTime()) ? null : d;
}

export function shouldShowSeparator(current, previous) {
  if (!previous) return true;

  if (!current?.createdAt || !previous?.createdAt) return false;

  const currentDate = parseTimestamp(current.createdAt);
  const previousDate = parseTimestamp(previous.createdAt);

  if (!currentDate || !previousDate) return false;

  const currentTime = currentDate.getTime();
  const previousTime = previousDate.getTime();

  const TEN_MINUTES = 10 * 60 * 1000;

  return currentTime - previousTime >= TEN_MINUTES;
}

const GROUP_MAX_GAP_MS = 60 * 1000; // < 1 minute = same visual group

/**
 * A message is a reply when it carries a quoted reference to another message.
 * E2E: replyTo can be a string (message ID) or an object (legacy snapshot).
 */
export function isReplyMessage(message) {
  if (!message) return false;
  return Boolean(
    message.replyToSnapshot ||
      message.replyTo
  );
}

/**
 * Determines whether a message visually connects to the previous/next one
 * (Messenger-style grouping): same sender AND within `GROUP_MAX_GAP_MS`.
 * Returns "single" | "first" | "middle" | "last".
 *
 * Reply messages break the group chain backward: a reply is never a
 * continuation ("middle" or "last") of the surrounding group.  It acts as
 * "single" or "first" (top of a new group).  Messages after the reply
 * continue the group normally.
 */
export function getMessageGroupPosition(message, previousMessage, nextMessage) {
  if (!message) return "single";

  const messageIsReply = isReplyMessage(message);

  const sameSenderAsPrev =
    !!previousMessage &&
    !messageIsReply &&
    previousMessage.senderId === message.senderId &&
    timeGapWithin(previousMessage.createdAt, message.createdAt, GROUP_MAX_GAP_MS);

  const sameSenderAsNext =
    !!nextMessage &&
    !isReplyMessage(nextMessage) &&
    nextMessage.senderId === message.senderId &&
    timeGapWithin(message.createdAt, nextMessage.createdAt, GROUP_MAX_GAP_MS);

  if (sameSenderAsPrev && sameSenderAsNext) return "middle";
  if (sameSenderAsPrev) return "last";
  if (sameSenderAsNext) return "first";
  return "single";
}

function timeGapWithin(aTimestamp, bTimestamp, maxMs) {
  const a = parseTimestamp(aTimestamp);
  const b = parseTimestamp(bTimestamp);
  if (!a || !b) return false;
  return Math.abs(b.getTime() - a.getTime()) < maxMs;
}

export function formatSeparator(timestamp) {
  if (!timestamp) return "";

  const date = parseTimestamp(timestamp);
  if (!date) return "";

  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const messageDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffDays = Math.floor((today - messageDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (diffDays === 1) {
    return `Yesterday ${date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  if (diffDays < 7) {
    return `${date.toLocaleDateString([], {
      weekday: "long",
    })} ${date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  return date.toLocaleString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
