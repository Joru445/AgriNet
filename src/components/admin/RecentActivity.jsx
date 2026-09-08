import { useLanguage } from "../../context/LanguageContext";
import { formatRelativeTime } from "../../utils/formatTime";

function Activity({ icon, title, description, timestamp, t }) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#2D6A4F]/10">
        <i className={`${icon} text-[11px] text-[#2D6A4F] dark:text-(--agri-brand]`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-(--agri-text)">{title}</p>
        <p className="mt-0.5 truncate text-xs text-(--agri-text-muted)">{description}</p>
      </div>

      <span className="shrink-0 text-[10px] text-(--agri-text-muted)">
        {formatRelativeTime(timestamp, t)}
      </span>
    </div>
  );
}

export default function RecentActivity({
  users = [],
  products = [],
  inquiries = [],
  showHeader = true,
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

  if (showHeader) {
    return (
      <section className="rounded-2xl border border-(--agri-border-subtle) bg-(--agri-card) shadow-lg shadow-black/5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-(--agri-border-subtle) px-3 py-2 bg-(--agri-hover)/50">
          <div>
            <h2 className="text-sm font-bold text-(--agri-text)">{t("admin.recentActivity")}</h2>
            <p className="mt-0.5 text-[11px] text-(--agri-text-muted) font-medium">
              {t("admin.latestActivity")}
            </p>
          </div>
        </div>

        {activities.length === 0 ? (
          <div className="p-4 text-center text-xs font-medium text-(--agri-text-muted)">
            {t("admin.noRecentActivity")}
          </div>
        ) : (
          <div className="divide-y divide-(--agri-border-subtle)">
            {activities.map((activity, index) => {
              let icon = "ri-notification-3-line";
              if (activity.type === "user") icon = "ri-user-add-line";
              if (activity.type === "product") icon = "ri-shopping-basket-line";
              if (activity.type === "inquiry") icon = "ri-message-3-line";

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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {activities.length === 0 ? (
        <div className="p-4 text-center text-xs font-medium text-(--agri-text-muted)">
          {t("admin.noRecentActivity")}
        </div>
      ) : (
        <div className="divide-y divide-(--agri-border-subtle)">
          {activities.map((activity, index) => {
            let icon = "ri-notification-3-line";
            if (activity.type === "user") icon = "ri-user-add-line";
            if (activity.type === "product") icon = "ri-shopping-basket-line";
            if (activity.type === "inquiry") icon = "ri-message-3-line";

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
    </div>
  );
}
