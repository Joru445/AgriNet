export function formatTimestamp(timestamp) {
  if (!timestamp) return "";

  const date =
    typeof timestamp?.toDate === "function"
      ? timestamp.toDate()
      : timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diff = now - date;
  const day = 1000 * 60 * 60 * 24;

  if (diff < day) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (diff < day * 2) {
    return "Yesterday";
  }

  if (diff < day * 7) {
    return date.toLocaleDateString([], {
      weekday: "short",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}

export function formatFullDateTime(timestamp) {
  if (!timestamp) return "";

  const date =
    typeof timestamp?.toDate === "function"
      ? timestamp.toDate()
      : timestamp instanceof Date
      ? timestamp
      : new Date(timestamp);

  if (isNaN(date.getTime())) return "";

  const datePart = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart}, ${timePart}`;
}
