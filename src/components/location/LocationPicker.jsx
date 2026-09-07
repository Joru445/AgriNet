import { useLanguage } from "../../context/LanguageContext";

import LocationMap from "./LocationMap";

import useUserLocation from "../../hooks/useUserLocation";

export default function LocationPicker({
  editing,
  value,
  onProfile = false,
  onChange,
  hideLabel = false,
  hideCoordinates = false,
}) {
  const { t } = useLanguage();
  const { loadingLocation, refreshLocation } = useUserLocation(false);

  async function handleUseCurrentLocation() {
    const location = await refreshLocation();

    if (!location) return;

    onChange(location);
  }

  return (
    <div className="space-y-5">
      {!hideLabel && (
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          {t("location.farmLocation")}
        </label>
      )}

      <LocationMap
        editing={editing}
        value={value}
        onProfile={onProfile}
        onChange={onChange}
        actionButton={
          editing ? (
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={loadingLocation}
              aria-label={t("location.useMyLocationAria")}
              className="px-3 h-10 rounded-xl bg-[#2D6A4F] text-white hover:bg-[#24563f] disabled:opacity-50 shadow-lg"
            >
              {loadingLocation ? (
                <i className="ri-loader-4-line animate-spin" />
              ) : (
                <i className="ri-crosshair-2-line" />
              )}
            </button>
          ) : null
        }
      />

      {value?.address && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
          <div className="mb-1 text-xs font-medium text-gray-500">
            {t("location.selectedAddress")}
          </div>

          <div className="text-sm text-[#2D6A4F]">
            <i className="ri-map-pin-line mr-1" />
            {value.address}
          </div>
        </div>
      )}

      {!hideCoordinates && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500">{t("location.latitude")}</label>

            <input
              readOnly
              value={value?.lat?.toFixed(6) ?? ""}
              className="w-full pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">{t("location.longitude")}</label>

            <input
              readOnly
              value={value?.lng?.toFixed(6) ?? ""}
              className="w-full pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}