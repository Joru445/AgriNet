import StarRating from "./StarRating";

import LocationPicker from "../../location/LocationPicker";
import { useLanguage } from "../../../context/LanguageContext";

const labelClass =
  "block text-sm font-medium text-[var(--agri-text-secondary)] mb-1.5";

export default function FarmerSection({ form, stats, editing, onChange }) {
  const { t } = useLanguage();

  const statsItems = [
    { key: "products", icon: "ri-shopping-bag-3-line", value: stats.products ?? 0 },
    { key: "reviews", icon: "ri-star-line", value: stats.reviews ?? 0 },
    { key: "inquiries", icon: "ri-chat-3-line", value: stats.inquiries ?? 0 },
    { key: "completed", icon: "ri-check-double-line", value: stats.completed ?? 0 },
  ];

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-sm">
      <div className="border-b border-[var(--agri-border-subtle)] px-5 py-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-[var(--agri-text)]">
          <i className="ri-store-2-line text-lg text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
          {t("profile.farmerInfo")}
        </h2>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {/* Store name + rating (always visible, read-only identity) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-elevated)] px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--agri-brand-bg)] text-[#2D6A4F] dark:text-[var(--agri-brand)]">
              <i className="ri-store-2-line text-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("profile.storeName")}
              </p>
              <p className="truncate text-sm font-bold text-[var(--agri-text)]">
                {form.storeName || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-elevated)] px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
              <i className="ri-star-fill text-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("profile.rating")}
              </p>
              <StarRating rating={form.rating || 0} showValue />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          {editing ? (
            <>
              <label className={labelClass}>{t("profile.farmDescription")}</label>
              <textarea
                rows={4}
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder={t("profile.farmDescriptionPlaceholder")}
                className="w-full px-4 py-3 rounded-xl border border-[var(--agri-input-border)] bg-[var(--agri-input-bg)] text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
              />
            </>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-elevated)] px-4 py-3.5">
              <i className="ri-leaf-line mt-0.5 text-lg text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                  {t("profile.farmDescription")}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-[var(--agri-text-secondary)]">
                  {form.description || "—"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Location */}
        {editing ? (
          <LocationPicker
            editing={editing}
            value={form.location}
            onProfile={true}
            onChange={(location) =>
              onChange({ target: { name: "location", value: location } })
            }
          />
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-[var(--agri-border-subtle)] bg-[var(--agri-elevated)] px-4 py-3.5">
            <i className="ri-map-pin-2-line mt-0.5 text-lg text-[#2D6A4F] dark:text-[var(--agri-brand)] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
                {t("location.farmLocation")}
              </p>
              <p className="mt-0.5 text-sm font-medium text-[var(--agri-text)]">
                {form.location?.address || "—"}
              </p>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div>
          <p className="mb-3 text-sm font-bold text-[var(--agri-text)]">
            {t("profile.farmStats")}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statsItems.map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-elevated)] p-4 text-center"
              >
                <i className={`${item.icon} text-lg text-[#2D6A4F] dark:text-[var(--agri-brand)]`} />
                <p className="mt-1.5 text-2xl font-bold text-[var(--agri-text)]">
                  {item.value}
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--agri-text-muted)]">
                  {t(`profile.stats.${item.key}`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}