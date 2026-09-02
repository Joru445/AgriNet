import { useLanguage } from "../../../context/LanguageContext";

export default function EmptyNearby() {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
      <i className="ri-map-pin-line text-5xl text-gray-300" />

      <h3 className="mt-4 text-lg font-semibold text-gray-700">
        {t("nearby.noFarmers")}
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        {t("nearby.noFarmersHint")}
      </p>
    </div>
  );
}
