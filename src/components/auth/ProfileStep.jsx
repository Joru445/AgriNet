import { useEffect, useState } from "react";
import LocationPicker from "../location/LocationPicker";
import useUserLocation from "../../hooks/useUserLocation";
import { useLanguage } from "../../context/LanguageContext";

export default function ProfileStep({
  form,
  errors = {},
  touched = {},
  loading = false,
  updateField,
  setFieldTouched,
  updateLocation,
  onBack,
  onSubmit,
}) {
  const { t } = useLanguage();

  const { refreshLocation } = useUserLocation(false);
  const [detectingLocation, setDetectingLocation] = useState(
    () =>
      form.role === "farmer" &&
      !(form.location?.lat != null && form.location?.lng != null),
  );

  const phoneError = touched.contactNumber ? errors.contactNumber : null;
  const locationError = touched.location ? errors.location : null;

  // Auto-detect the farmer's location when landing on the profile step,
  // only if a location hasn't already been set by the user.
  useEffect(() => {
    if (form.role !== "farmer") return;
    if (form.location?.lat != null && form.location?.lng != null) return;

    let cancelled = false;

    setDetectingLocation(true);

    refreshLocation()
      .then((location) => {
        if (cancelled) return;
        if (location) {
          updateLocation(location);
        }
      })
      .catch(() => {
        // Gracefully ignore: user can fall back to manual selection
      })
      .finally(() => {
        if (!cancelled) setDetectingLocation(false);
      });

    return () => {
      cancelled = true;
    };
    // Run once on mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4 w-full">
      {/* Contact Number Field */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          {t("auth.register.contactNumber")} <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="tel"
            inputMode="numeric"
            maxLength={13}
            placeholder="09XXXXXXXXX"
            value={form.contactNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d+]/g, "");
              updateField("contactNumber", value);
            }}
            onBlur={() => setFieldTouched?.("contactNumber")}
            className={`w-full pl-8 pr-10 py-2.5 border-2 rounded-lg text-sm focus:outline-none transition-colors ${
              phoneError
                ? "border-red-500 focus:border-red-500 bg-red-50/20"
                : "border-gray-200 focus:border-[#2D6A4F]"
            }`}
          />
        </div>

        {phoneError && (
          <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
            <i className="ri-error-warning-line text-xs" />
            <span>{phoneError}</span>
          </p>
        )}
      </div>

      {/* Farmer Location Picker */}
      {form.role === "farmer" && (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            {t("auth.register.farmLocation")} <span className="text-red-500">*</span>
          </label>

          <LocationPicker
            editing
            value={form.location}
            onChange={updateLocation}
          />

          {detectingLocation && (
            <p className="mt-1.5 text-xs text-[#2D6A4F] font-medium flex items-center gap-1">
              <i className="ri-loader-4-line animate-spin text-xs" />
              <span>{t("auth.register.detectingLocation")}</span>
            </p>
          )}

          {!detectingLocation &&
            !locationError &&
            !(form.location?.lat != null && form.location?.lng != null) && (
              <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
                <i className="ri-information-line text-xs" />
                <span>{t("auth.register.setLocationManually")}</span>
              </p>
            )}

          {locationError && (
            <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
              <i className="ri-error-warning-line text-xs" />
              <span>{locationError}</span>
            </p>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex-1 border-2 border-gray-300 hover:border-gray-400 py-3 text-gray-700 font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-50"
        >
          {t("common.back")}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onSubmit}
          className="flex-1 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-75 cursor-pointer shadow-sm"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin text-base" />
              <span>{t("auth.register.creating")}</span>
            </>
          ) : (
            <span>{t("auth.register.createAccount")}</span>
          )}
        </button>
      </div>
    </div>
  );
}
