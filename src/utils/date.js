export function formatTimestamp(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate();
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
