import NotificationItem from "./NotificationItem";

export default function NotificationList({
  notifications = [],
  loading = false,
}) {
  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-[var(--agri-text-muted)]">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--agri-border)] bg-[var(--agri-card)] px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--agri-hover)] text-[var(--agri-text-muted)]">
          <i className="ri-notification-off-line text-2xl" />
        </div>

        <h2 className="mt-4 font-semibold text-[var(--agri-text)]">
          No notifications yet
        </h2>

        <p className="mt-1 text-sm text-[var(--agri-text-muted)]">You're all caught up.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}
