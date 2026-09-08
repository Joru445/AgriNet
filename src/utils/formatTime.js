export function formatRelativeTime(timestamp, t) {
  if (!timestamp) {
    return "";
  }

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) {
    return t ? t("time.justNow") : "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return t ? t("time.minAgo", { count: minutes }) : `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return t ? t("time.hrAgo", { count: hours }) : `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return t ? t("time.dayAgo", { count: days }) : `${days}d ago`;
  }

  return date.toLocaleDateString();
}