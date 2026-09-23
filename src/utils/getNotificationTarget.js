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

    case "group": {
      const event = notification.data?.event;
      if (
        event === "manager_assigned" ||
        event === "manager_permissions_updated"
      ) {
        return `/manage/groups/${notification.entityId}`;
      }
      return `/groups/${notification.entityId}`;
    }

    default:
      return "/";
  }
}
