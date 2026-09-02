/**
 * Resolves a notification data payload into a route URL for deep-linking.
 *
 * Push notification payloads from the service worker include a `data` field.
 * This utility maps that data to AgriNet routes.
 *
 * Expected payload shape:
 * {
 *   url?: string,           // Direct URL (highest priority)
 *   entityType?: string,    // "message" | "inquiry" | "product" | "notification"
 *   entityId?: string,      // The document/entity ID
 *   conversationId?: string // For message notifications
 * }
 */

/**
 * Build a route URL from notification data.
 * Falls back to "/" if no recognizable pattern is found.
 */
export function resolveNotificationRoute(data) {
  if (!data) return "/";

  // Direct URL takes priority
  if (data.url && typeof data.url === "string") {
    // Validate it's a relative path (not external)
    if (data.url.startsWith("/") && !data.url.startsWith("//")) {
      return data.url;
    }
  }

  // Build route from entity type + ID
  const { entityType, entityId, conversationId } = data;

  if (entityType === "message" && conversationId) {
    return `/messages?conversation=${conversationId}`;
  }

  if (entityType === "inquiry" && entityId) {
    // Default to consumer transactions page — the app will handle role routing
    return `/transactions`;
  }

  if (entityType === "product" && entityId) {
    return `/product/${entityId}`;
  }

  if (entityType === "notification") {
    return `/notifications`;
  }

  return "/";
}

/**
 * Parse push notification data from a service worker message event.
 * The SW sends structured data when a notification is clicked.
 */
export function parsePushPayload(pushData) {
  if (!pushData) return {};

  if (typeof pushData === "string") {
    try {
      return JSON.parse(pushData);
    } catch {
      return {};
    }
  }

  return pushData;
}
