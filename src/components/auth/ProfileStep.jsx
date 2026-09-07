import { useEffect, useState } from "react";
import LocationPicker from "../location/LocationPicker";
import useUserLocation from "../../hooks/useUserLocation";
import {
  authFieldErrorClass,
  authInputBaseClass,
  authInputErrorClass,
  authInputIconClass,
  authInputNormalClass,
  authLabelClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
} from "./authStyles";
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
        <label className={authLabelClass}>
          {t("auth.register.contactNumber")} <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <i className={`ri-phone-line ${authInputIconClass}`} />
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
            className={`${authInputBaseClass} pl-10 pr-3 ${
              phoneError
                ? authInputErrorClass
                : authInputNormalClass
            }`}
          />
        </div>

        {phoneError && (
          <p className={authFieldErrorClass}>
            <i className="ri-error-warning-line text-xs" />
            <span>{phoneError}</span>
          </p>
        )}
      </div>

      {/* Farmer Location Picker */}
      {form.role === "farmer" && (
        <div>
          <label className={authLabelClass}>
            {t("auth.register.farmLocation")} <span className="text-red-500">*</span>
          </label>

          <LocationPicker
            editing
            hideLabel
            hideCoordinates
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
          className={`flex-1 ${authSecondaryButtonClass}`}
        >
          {t("common.back")}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onSubmit}
          className={`flex-1 ${authPrimaryButtonClass}`}
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
