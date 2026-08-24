export function getNotificationTarget(notification) {
  switch (notification.entityType) {
    case "conversation":
      return `/messages?conversation=${notification.entityId}`;

    case "inquiry":
      return `/inquiries?id=${notification.entityId}`;

    case "product":
      return `/products/${notification.entityId}`;

    default:
      return "/";
  }
}
