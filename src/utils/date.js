export function parseDate(timestamp) {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return isNaN(timestamp.getTime()) ? null : timestamp;
  if (typeof timestamp?.toDate === "function") {
    try {
      const d = timestamp.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    } catch { /* Firebase timestamp .toDate() may throw */ }
  }
  if (typeof timestamp?.toMillis === "function") {
    try {
      const d = new Date(timestamp.toMillis());
      if (!isNaN(d.getTime())) return d;
    } catch { /* Firebase timestamp .toMillis() may throw */ }
  }
  if (typeof timestamp?.seconds === "number") {
    return new Date(timestamp.seconds * 1000);
  }
  if (typeof timestamp?._seconds === "number") {
    return new Date(timestamp._seconds * 1000);
  }
  if (typeof timestamp === "number") {
    const d = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    return isNaN(d.getTime()) ? null : d;
  }
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? null : date;
}

export function formatTimestamp(timestamp) {
  const date = parseDate(timestamp);
  if (!date) return "";

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

export function formatDate(timestamp) {
  const date = parseDate(timestamp);
  if (!date) return "";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatFullDateTime(timestamp) {
  const date = parseDate(timestamp);
  if (!date) return "";

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
