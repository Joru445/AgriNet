import { useLanguage } from "../../context/LanguageContext";

function formatRelativeTime(timestamp, t) {
  if (!timestamp) {
    return t("admin.recentlyLabel");
  }

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) {
    return t("time.justNow");
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return t("time.minAgo", { count: minutes });
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return t("time.hrAgo", { count: hours });
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return t("time.dayAgo", { count: days });
  }

  return date.toLocaleDateString();
}

function Activity({ icon, title, description, timestamp, t }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2D6A4F]/10">
        <i className={`${icon} text-[#2D6A4F] dark:text-[var(--agri-brand)]`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--agri-text)]">{title}</p>

        <p className="mt-0.5 text-sm text-[var(--agri-text-muted)]">{description}</p>
      </div>

      <span className="shrink-0 text-xs text-[var(--agri-text-muted)]">
        {formatRelativeTime(timestamp, t)}
      </span>
    </div>
  );
}

export default function RecentActivity({
  users = [],
  products = [],
  inquiries = [],
}) {
  const { t } = useLanguage();

  const activities = [
    ...users.map((user) => ({
      type: "user",
      title: t("admin.newUserRegistered"),
      description:
        user.fullname ||
        user.username ||
        user.email ||
        t("admin.newUserJoined"),
      timestamp: user.createdAt,
    })),

    ...products.map((product) => ({
      type: "product",
      title: t("admin.newProductListed"),
      description: product.name || t("admin.newProductWasListed"),
      timestamp: product.createdAt,
    })),

    ...inquiries.map((inquiry) => ({
      type: "inquiry",
      title: t("admin.newInquiryCreated"),
      description:
        inquiry.productSnapshot?.name || t("admin.newInquiryDescription"),
      timestamp: inquiry.createdAt,
    })),
  ]
    .filter((activity) => activity.timestamp)
    .sort((a, b) => {
      const aDate = a.timestamp.toDate
        ? a.timestamp.toDate()
        : new Date(a.timestamp);

      const bDate = b.timestamp.toDate
        ? b.timestamp.toDate()
        : new Date(b.timestamp);

      return bDate - aDate;
    })
    .slice(0, 4);

  return (
    <section className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-lg shadow-black/5 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--agri-border-subtle)] p-5 bg-[var(--agri-hover)]/50">
        <div>
          <h2 className="text-base font-bold text-[var(--agri-text)]">{t("admin.recentActivity")}</h2>

          <p className="mt-0.5 text-xs text-[var(--agri-text-muted)] font-medium">
            {t("admin.latestActivity")}
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--agri-card)] border border-[var(--agri-border-subtle)] text-[var(--agri-text-muted)] shadow-2xs">
          <i className="ri-time-line text-base text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="p-8 text-center text-sm font-medium text-[var(--agri-text-muted)]">
          {t("admin.noRecentActivity")}
        </div>
      ) : (
        <div className="divide-y divide-[var(--agri-border-subtle)]">
          {activities.map((activity, index) => {
            let icon = "ri-notification-3-line";

            if (activity.type === "user") {
              icon = "ri-user-add-line";
            }

            if (activity.type === "product") {
              icon = "ri-shopping-basket-line";
            }

            if (activity.type === "inquiry") {
              icon = "ri-message-3-line";
            }

            return (
              <Activity
                key={`${activity.type}-${index}`}
                icon={icon}
                title={activity.title}
                description={activity.description}
                timestamp={activity.timestamp}
                t={t}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
