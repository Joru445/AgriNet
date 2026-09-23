import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { getUserLocation } from "../../../services/geolocation";
import { showToast } from "../../../utils/toast";
import LeafletMapPreview from "./LeafletMapPreview";
import { markLocationPermanentlyEnded } from "../../../utils/endedLocations";

const DURATION_OPTIONS = [
  { value: 15, key: "shareDuration15m", shortKey: "15m" },
  { value: 30, key: "shareDuration30m", shortKey: "30m" },
  { value: 60, key: "shareDuration60m", shortKey: "60m" },
];

export default function ShareLocationModal({
  isOpen,
  onClose,
  onSendLocation,
  onStopLiveLocation,
  hasActiveLiveLocation = false,
  activeLiveMessageId = null,
}) {
  const { t } = useLanguage();
  const { profile } = useAuth();

  const isFarmer = profile?.role === "farmer" || Boolean(profile?.storeName);

  const farmAddress =
    profile?.location?.address ||
    profile?.address ||
    [profile?.barangay, profile?.municipality].filter(Boolean).join(", ") ||
    null;

  const farmLat = Number(profile?.location?.lat);
  const farmLng = Number(profile?.location?.lng);
  const hasFarmCoords = !isNaN(farmLat) && !isNaN(farmLng) && farmLat !== 0;

  const farmLocation = hasFarmCoords
    ? {
        lat: farmLat,
        lng: farmLng,
        address: farmAddress || "Farm Location",
      }
    : null;

  const [mode, setMode] = useState("live"); // 'farm_address' | 'live' | 'current'
  const [duration, setDuration] = useState(15); // minutes
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEnding, setIsEnding] = useState(false);

  const fetchLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!navigator.geolocation) {
        throw new Error(t("messages.locationUnavailable"));
      }

      const loc = await getUserLocation();
      setCoords(loc);
    } catch (err) {
      console.warn("[ShareLocationModal] Geolocation error:", err);
      if (err?.code === 1) {
        setError(t("messages.locationPermissionDenied"));
      } else {
        setError(err?.message || t("messages.locationUnavailable"));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (isFarmer && farmLocation) {
        setMode("farm_address");
      } else {
        setMode("live");
      }
      fetchLocation();
    } else {
      setCoords(null);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, isFarmer, hasFarmCoords]);

  if (!isOpen) return null;

  const activeCoords = mode === "farm_address" ? farmLocation : coords;

  const handleEndLiveLocation = async () => {
    if (!activeLiveMessageId) return;
    setIsEnding(true);
    try {
      markLocationPermanentlyEnded(activeLiveMessageId);
      if (onStopLiveLocation) {
        await onStopLiveLocation(activeLiveMessageId);
      }
    } catch (err) {
      console.error("[ShareLocationModal] Failed to stop live location:", err);
    } finally {
      setIsEnding(false);
    }
  };

  const handleConfirm = () => {
    if (hasActiveLiveLocation) {
      showToast.warning(t("messages.endLiveLocationToShareAnother"));
      return;
    }

    if (mode === "farm_address") {
      if (!farmLocation) return;
      onSendLocation?.({
        type: "location",
        location: {
          lat: farmLocation.lat,
          lng: farmLocation.lng,
          address: farmLocation.address,
          accuracy: null,
          updatedAt: Date.now(),
        },
        liveUntil: null,
        isLive: null,
      });
      onClose();
      return;
    }

    if (!coords) return;

    if (mode === "live") {
      const liveUntil = Date.now() + duration * 60 * 1000;
      onSendLocation?.({
        type: "live_location",
        location: {
          lat: coords.lat,
          lng: coords.lng,
          accuracy: coords.accuracy || null,
          updatedAt: Date.now(),
        },
        liveUntil,
        isLive: true,
      });
    } else {
      onSendLocation?.({
        type: "location",
        location: {
          lat: coords.lat,
          lng: coords.lng,
          accuracy: coords.accuracy || null,
          updatedAt: Date.now(),
        },
        liveUntil: null,
        isLive: null,
      });
    }

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-(--agri-card) border border-(--agri-border) rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b border-(--agri-border-subtle) shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#2D6A4F]/10 dark:bg-(--agri-brand)/10 text-[#2D6A4F] dark:text-(--agri-brand) flex items-center justify-center shrink-0">
              <i className="ri-map-pin-2-fill text-base" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-(--agri-text) truncate">
              {t("messages.shareLocation")}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-(--agri-text-muted) hover:text-(--agri-text) hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 overflow-y-auto scrollbar-none">
          {/* Integrated Map Preview Widget with overlay chip */}
          <div className={`relative w-full ${activeCoords ? "h-28 sm:h-32" : "min-h-[7.5rem] sm:min-h-[8rem] h-auto"} rounded-2xl overflow-hidden border border-(--agri-border) shadow-xs shrink-0 bg-neutral-100 dark:bg-neutral-800 flex flex-col justify-center`}>
            {activeCoords ? (
              <>
                <LeafletMapPreview
                  lat={activeCoords.lat}
                  lng={activeCoords.lng}
                  isLiveActive={mode === "live"}
                  isLiveType={mode === "live"}
                  isSenderFarmer={isFarmer}
                  className="w-full h-full"
                />

                {/* Floating Status Pill over Map */}
                <div className="absolute top-2 left-2 z-[400] max-w-[calc(100%-1rem)] pointer-events-auto">
                  {mode === "farm_address" ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 dark:bg-neutral-900/95 shadow-md border border-(--agri-border) backdrop-blur-xs text-[11px] font-semibold text-(--agri-text) truncate">
                      <i className="ri-store-2-fill text-xs text-[#2D6A4F] dark:text-(--agri-brand) shrink-0" />
                      <span className="truncate">{farmAddress || t("messages.shareFarmAddress")}</span>
                      <span className="text-[9px] font-extrabold px-1 py-0.2 rounded bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-(--agri-brand) shrink-0">
                        SET
                      </span>
                    </div>
                  ) : coords ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/95 dark:bg-neutral-900/95 shadow-md border border-(--agri-border) backdrop-blur-xs text-[11px] font-semibold text-(--agri-text) truncate">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="truncate text-emerald-700 dark:text-emerald-300 font-bold">
                        {coords.accuracy
                          ? t("messages.locationAccurateTo", { meters: Math.round(coords.accuracy) })
                          : "GPS Acquired"}
                      </span>
                      <button
                        type="button"
                        onClick={fetchLocation}
                        title="Refresh GPS"
                        className="w-4 h-4 rounded text-(--agri-text-muted) hover:text-(--agri-text) flex items-center justify-center shrink-0 transition cursor-pointer"
                      >
                        <i className="ri-refresh-line text-[10px]" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : loading ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#2D6A4F]/5 dark:bg-(--agri-brand)/5">
                <i className="ri-loader-4-line text-2xl text-[#2D6A4F] dark:text-(--agri-brand) animate-spin mb-1" />
                <p className="text-xs font-semibold text-(--agri-text)">{t("messages.locatingYou")}</p>
                <p className="text-[10px] text-(--agri-text-muted) mt-0.5">Please allow location access if prompted</p>
              </div>
            ) : error ? (
              <div className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-3.5 text-center bg-red-50 dark:bg-red-950/20">
                <i className="ri-error-warning-fill text-xl text-red-500 mb-1.5 shrink-0" />
                <p className="text-xs font-semibold text-red-700 dark:text-red-300 leading-relaxed px-2 break-words">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={fetchLocation}
                  className="mt-1.5 text-xs font-bold text-red-700 dark:text-red-400 underline hover:no-underline cursor-pointer transition active:scale-95"
                >
                  Try Again
                </button>
              </div>
            ) : null}
          </div>

          {/* Active Live Location Running Warning */}
          {hasActiveLiveLocation && activeLiveMessageId && (
            <div className="p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 shrink-0 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 min-w-0">
                <i className="ri-error-warning-fill text-amber-600 dark:text-amber-400 text-base shrink-0" />
                <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-200 leading-tight">
                  {t("messages.activeLiveLocationRunning")}
                </p>
              </div>
              {onStopLiveLocation && (
                <button
                  type="button"
                  onClick={handleEndLiveLocation}
                  disabled={isEnding}
                  className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition shrink-0 cursor-pointer shadow-xs whitespace-nowrap flex items-center gap-1 disabled:opacity-60"
                >
                  {isEnding ? (
                    <i className="ri-loader-4-line text-xs animate-spin" />
                  ) : (
                    <i className="ri-stop-circle-line text-xs" />
                  )}
                  <span>{t("messages.endLiveLocation")}</span>
                </button>
              )}
            </div>
          )}

          {/* Option 1: Farm Address (Farmer only) */}
          {isFarmer && (
            <div
              onClick={() => {
                if (farmLocation) setMode("farm_address");
              }}
              className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all ${
                !farmLocation
                  ? "opacity-60 border-dashed border-(--agri-border) bg-(--agri-card) cursor-not-allowed"
                  : mode === "farm_address"
                    ? "border-[#2D6A4F] dark:border-(--agri-brand) bg-[#2D6A4F]/5 dark:bg-(--agri-brand)/5 shadow-xs cursor-pointer"
                    : "border-(--agri-border) bg-(--agri-card) hover:border-(--agri-border-subtle) hover:bg-(--agri-hover)/50 cursor-pointer"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    mode === "farm_address"
                      ? "bg-[#2D6A4F] text-white shadow-md shadow-emerald-800/25"
                      : "bg-neutral-100 dark:bg-neutral-800 text-[#2D6A4F] dark:text-(--agri-brand)"
                  }`}
                >
                  <i className="ri-store-2-fill text-lg" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs sm:text-sm font-bold text-(--agri-text) flex items-center gap-1.5 truncate">
                      <span className="truncate">{t("messages.shareFarmAddress")}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-(--agri-brand) shrink-0">
                        SET ADDRESS
                      </span>
                    </h4>
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        mode === "farm_address"
                          ? "border-[#2D6A4F] dark:border-(--agri-brand)"
                          : "border-(--agri-border)"
                      }`}
                    >
                      {mode === "farm_address" && (
                        <div className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-(--agri-brand)" />
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] font-semibold text-[#2D6A4F] dark:text-(--agri-brand) mt-0.5 truncate">
                    {farmAddress || (farmLocation ? `${farmLocation.lat.toFixed(4)}, ${farmLocation.lng.toFixed(4)}` : t("messages.noFarmAddressSet"))}
                  </p>
                  <p className="text-[10px] text-(--agri-text-muted) mt-0.5 leading-snug">
                    {t("messages.farmAddressDesc")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Option 2: Live Location */}
          <div
            onClick={() => setMode("live")}
            className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              mode === "live"
                ? "border-[#2D6A4F] dark:border-(--agri-brand) bg-[#2D6A4F]/5 dark:bg-(--agri-brand)/5 shadow-xs"
                : "border-(--agri-border) bg-(--agri-card) hover:border-(--agri-border-subtle) hover:bg-(--agri-hover)/50"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  mode === "live"
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                }`}
              >
                <i className="ri-radar-fill text-lg" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs sm:text-sm font-bold text-(--agri-text) flex items-center gap-1.5 truncate">
                    <span className="truncate">{t("messages.shareLiveLocation")}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      LIVE
                    </span>
                  </h4>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      mode === "live"
                        ? "border-[#2D6A4F] dark:border-(--agri-brand)"
                        : "border-(--agri-border)"
                    }`}
                  >
                    {mode === "live" && (
                      <div className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-(--agri-brand)" />
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-(--agri-text-muted) mt-0.5 leading-snug">
                  {t("messages.liveLocationDesc")}
                </p>

                {/* Duration options when live mode is selected */}
                {mode === "live" && (
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-(--agri-border-subtle)">
                    {DURATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDuration(opt.value);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-bold transition cursor-pointer text-center truncate ${
                          duration === opt.value
                            ? "bg-[#2D6A4F] dark:bg-(--agri-brand) text-white shadow-sm"
                            : "bg-(--agri-hover) text-(--agri-text-secondary) hover:text-(--agri-text)"
                        }`}
                      >
                        {t(`messages.${opt.key}`)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Option 3: Current Location Static Pin */}
          <div
            onClick={() => setMode("current")}
            className={`p-3 sm:p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
              mode === "current"
                ? "border-[#2D6A4F] dark:border-(--agri-brand) bg-[#2D6A4F]/5 dark:bg-(--agri-brand)/5 shadow-xs"
                : "border-(--agri-border) bg-(--agri-card) hover:border-(--agri-border-subtle) hover:bg-(--agri-hover)/50"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  mode === "current"
                    ? "bg-[#2D6A4F] text-white shadow-md shadow-emerald-700/25"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                }`}
              >
                <i className="ri-map-pin-user-fill text-lg" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs sm:text-sm font-bold text-(--agri-text) truncate">
                    {t("messages.shareCurrentLocation")}
                  </h4>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      mode === "current"
                        ? "border-[#2D6A4F] dark:border-(--agri-brand)"
                        : "border-(--agri-border)"
                    }`}
                  >
                    {mode === "current" && (
                      <div className="w-2 h-2 rounded-full bg-[#2D6A4F] dark:bg-(--agri-brand)" />
                    )}
                  </div>
                </div>

                <p className="text-[10px] text-(--agri-text-muted) mt-0.5 leading-snug">
                  {t("messages.currentLocationDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 sm:py-3.5 border-t border-(--agri-border-subtle) flex items-center justify-end gap-2 shrink-0 bg-(--agri-hover)/30">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-(--agri-text-secondary) hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={
              hasActiveLiveLocation ||
              (mode === "farm_address" ? !farmLocation : (!coords || loading))
            }
            title={
              hasActiveLiveLocation
                ? t("messages.endLiveLocationToShareAnother")
                : undefined
            }
            className="px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#2D6A4F] hover:bg-[#1B4332] dark:bg-(--agri-brand) dark:hover:bg-(--agri-brand-dark) shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
          >
            {mode === "farm_address" ? (
              <>
                <i className="ri-store-2-fill text-sm" />
                <span>{t("messages.shareFarmAddress")}</span>
              </>
            ) : loading ? (
              <>
                <i className="ri-loader-4-line text-sm animate-spin" />
                <span>{t("messages.locatingYou")}</span>
              </>
            ) : mode === "live" ? (
              <>
                <i className="ri-radar-line text-sm" />
                <span>
                  {t("messages.shareLiveButton", { minutes: duration })}
                </span>
              </>
            ) : (
              <>
                <i className="ri-map-pin-2-fill text-sm" />
                <span>{t("messages.shareCurrentLocation")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
