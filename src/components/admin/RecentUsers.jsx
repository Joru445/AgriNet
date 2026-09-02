import { useLanguage } from "../../context/LanguageContext";

import RoleBadge from "../common/RoleBadge";
import UserIdentity from "../common/UserIdentity";

export default function RecentUsers({ users = [] }) {
  const { t } = useLanguage();
  const displayedUsers = users.slice(0, 4);

  return (
    <section className="rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-lg shadow-black/5 overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--agri-border-subtle)] p-5 bg-[var(--agri-hover)]/50">
        <div>
          <h2 className="text-base font-bold text-[var(--agri-text)]">{t("admin.recentUsers")}</h2>

          <p className="mt-0.5 text-xs text-[var(--agri-text-muted)] font-medium">
            {t("admin.recentlyRegistered")}
          </p>
        </div>

        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--agri-card)] border border-[var(--agri-border-subtle)] text-[var(--agri-text-muted)] shadow-2xs">
          <i className="ri-user-smile-line text-base text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
        </div>
      </div>

      {displayedUsers.length === 0 ? (
        <div className="p-8 text-center text-sm font-medium text-[var(--agri-text-muted)]">
          {t("admin.noUsersFound")}
        </div>
      ) : (
        <div className="divide-y divide-[var(--agri-border-subtle)]">
          {displayedUsers.map((user) => {
            return (
              <div
                key={user.id || user.uid}
                className="flex items-center justify-between gap-3 p-4 hover:bg-[var(--agri-hover)]/60 transition-colors"
              >
                <UserIdentity user={user} size="lg" />

                <RoleBadge role={user.role} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
