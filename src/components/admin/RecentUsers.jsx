import { useLanguage } from "../../context/LanguageContext";

import RoleBadge from "../common/RoleBadge";
import UserIdentity from "../common/UserIdentity";

export default function RecentUsers({ users = [], showHeader = true }) {
  const { t } = useLanguage();
  const displayedUsers = users.slice(0, 4);

  if (showHeader) {
    return (
      <section className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-lg shadow-black/5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--agri-border-subtle)] px-3 py-2 bg-[var(--agri-hover)]/50">
          <div>
            <h2 className="text-sm font-bold text-[var(--agri-text)]">{t("admin.recentUsers")}</h2>
            <p className="mt-0.5 text-[11px] text-[var(--agri-text-muted)] font-medium">
              {t("admin.recentlyRegistered")}
            </p>
          </div>
        </div>

        {displayedUsers.length === 0 ? (
          <div className="p-4 text-center text-xs font-medium text-[var(--agri-text-muted)]">
            {t("admin.noUsersFound")}
          </div>
        ) : (
          <div className="divide-y divide-[var(--agri-border-subtle)]">
            {displayedUsers.map((user) => (
              <div
                key={user.id || user.uid}
                className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-[var(--agri-hover)]/60 transition-colors"
              >
                <UserIdentity user={user} size="md" />
                <RoleBadge role={user.role} />
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {displayedUsers.length === 0 ? (
        <div className="p-4 text-center text-xs font-medium text-[var(--agri-text-muted)]">
          {t("admin.noUsersFound")}
        </div>
      ) : (
        <div className="divide-y divide-[var(--agri-border-subtle)]">
          {displayedUsers.map((user) => (
            <div
              key={user.id || user.uid}
              className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-[var(--agri-hover)]/60 transition-colors"
            >
              <UserIdentity user={user} size="md" />
              <RoleBadge role={user.role} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
