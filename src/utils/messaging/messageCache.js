// Volatile, bounded message cache. Keys always include the Firebase UID so a
// saved-account switch can never render another account's conversation.
const cache = new Map();
const MAX_CACHED_CONVERSATIONS = 40;
const MAX_MESSAGES_PER_CONVERSATION = 200;

function timestamp(message) {
  if (typeof message?.createdAt === "number") return message.createdAt;
  if (message?.createdAt?.seconds != null) return message.createdAt.seconds * 1000;
  return 0;
}

function trimHistory(value) {
  if (!(value?.map instanceof Map) || value.map.size <= MAX_MESSAGES_PER_CONVERSATION) return value;
  const recent = Array.from(value.map.values())
    .sort((a, b) => timestamp(b) - timestamp(a))
    .slice(0, MAX_MESSAGES_PER_CONVERSATION);
  value.map = new Map(recent.map((message) => [message.id, message]));
  return value;
}

export function getMessageCache(uid, conversationId) {
  if (!uid || !conversationId) return null;
  return cache.get(`${uid}:${conversationId}`) || null;
}

export function setMessageCache(uid, conversationId, value) {
  if (!uid || !conversationId) return value;
  trimHistory(value);
  const key = `${uid}:${conversationId}`;
  cache.delete(key);
  cache.set(key, value);
  while (cache.size > MAX_CACHED_CONVERSATIONS) cache.delete(cache.keys().next().value);
  return value;
}

export function clearMessageCache(uid) {
  if (!uid) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) if (key.startsWith(`${uid}:`)) cache.delete(key);
}

export function getMessageCacheMetrics() {
  return { conversations: cache.size };
}
