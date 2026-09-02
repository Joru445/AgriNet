export function getNotificationTarget(notification) {
  switch (notification.entityType) {
    case "message": {
      const conversationId =
        notification.data?.conversationId || notification.entityId;
      return `/messages?conversation=${conversationId}`;
    }

    case "conversation":
      return `/messages?conversation=${notification.entityId}`;

    case "inquiry":
      return `/transactions`;

    case "product":
      return `/products/${notification.entityId}`;

    case "report":
      return "/";

    default:
      return "/";
  }
}
