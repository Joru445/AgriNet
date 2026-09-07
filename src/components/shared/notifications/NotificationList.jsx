import { useEffect, useRef } from "react";

import { useLanguage } from "../../../context/LanguageContext";
import NotificationItem from "./NotificationItem";

export default function NotificationList({
  notifications = [],
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
}) {
  const { t } = useLanguage();
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) {
          onLoadMore?.();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-[var(--agri-text-muted)]">
        {t("notifications.loading")}
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
          {t("notifications.emptyTitle")}
        </h2>

        <p className="mt-1 text-sm text-[var(--agri-text-muted)]">{t("notifications.emptySubtitle")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}

      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex justify-center py-6 text-sm text-[var(--agri-text-muted)]"
        >
          {loadingMore && (
            <span className="inline-flex items-center gap-2">
              <i className="ri-loader-4-line animate-spin" />
              {t("notifications.loadingMore")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}