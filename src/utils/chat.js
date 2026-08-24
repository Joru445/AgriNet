function parseTimestamp(timestamp) {
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
