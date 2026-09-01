function toSeconds(timestamp) {
  if (!timestamp) return 0;
  if (timestamp.seconds != null) return timestamp.seconds;
  if (typeof timestamp.toMillis === "function")
    return timestamp.toMillis() / 1000;
  if (typeof timestamp === "number") return timestamp / 1000;
  return 0;
}

export function sortByCreatedAt(a, b) {
  return toSeconds(a?.createdAt) - toSeconds(b?.createdAt);
}
