import StarRating from "./StarRating";

import LocationPicker from "../../location/LocationPicker";
import { useLanguage } from "../../../context/LanguageContext";

export default function FarmerSection({ form, stats, editing, onChange }) {
  const { t } = useLanguage();

  return (
    <div className="border-t border-[var(--agri-border-subtle)] px-4 lg:px-8 py-8">
      <h2 className="text-lg font-bold text-[var(--agri-text)] mb-6">
        {t("profile.farmerInfo")}
      </h2>

      <LocationPicker
        editing={editing}
        value={form.location}
        onProfile={true}
        onChange={(location) =>
          onChange({
            target: {
              name: "location",
              value: location,
            },
          })
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-[var(--agri-text-secondary)] mb-2">
            {t("profile.rating")}
          </label>

          <div className="h-[42px] flex items-center">
            <StarRating rating={form.rating || 0} />
          </div>
        </div>
      </div>

      {/* Farm Description */}
      <div className="mt-6">
        <label className="block text-sm font-semibold text-[var(--agri-text-secondary)] mb-2">
          {t("profile.farmDescription")}
        </label>

        <textarea
          rows={4}
          name="description"
          value={form.description}
          onChange={onChange}
          disabled={!editing}
          placeholder={t("profile.farmDescriptionPlaceholder")}
          className="w-full px-4 py-3 rounded-xl border border-[var(--agri-input-border)] bg-[var(--agri-input-bg)] text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] disabled:opacity-60 resize-none focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-elevated)] p-5 text-center">
          <p className="text-3xl font-bold text-[#2D6A4F]">
            {stats.products ?? 0}
          </p>

          <p className="text-sm text-[var(--agri-text-muted)] mt-2">{t("profile.stats.products")}</p>
        </div>

        <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-elevated)] p-5 text-center">
          <p className="text-3xl font-bold text-[#2D6A4F]">
            {stats.reviews ?? 0}
          </p>

          <p className="text-sm text-[var(--agri-text-muted)] mt-2">{t("profile.stats.reviews")}</p>
        </div>

        <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-elevated)] p-5 text-center">
          <p className="text-3xl font-bold text-[#2D6A4F]">
            {stats.inquiries ?? 0}
          </p>

          <p className="text-sm text-[var(--agri-text-muted)] mt-2">{t("profile.stats.inquiries")}</p>
        </div>

        <div className="rounded-2xl border border-[var(--agri-border)] bg-[var(--agri-elevated)] p-5 text-center">
          <p className="text-3xl font-bold text-[#2D6A4F]">
            {stats.completed ?? 0}
          </p>

          <p className="text-sm text-[var(--agri-text-muted)] mt-2">{t("profile.stats.completed")}</p>
        </div>
      </div>
    </div>
  );
}
