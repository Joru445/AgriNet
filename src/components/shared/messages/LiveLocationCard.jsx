import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { auth } from "../../../firebase/auth";
import { useLanguage } from "../../../context/LanguageContext";
import useUserLocation from "../../../hooks/useUserLocation";
import LeafletMapPreview from "./LeafletMapPreview";
import {
  getPermanentlyEndedLocations,
  markLocationPermanentlyEnded,
} from "../../../utils/endedLocations";

const LeafletLocationModal = lazy(() => import("./LeafletLocationModal"));

function formatRemainingTime(ms) {
  if (ms <= 0) return "0m";
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  if (mins > 0) return `${mins}m`;
  return `${secs}s`;
}

export default function LiveLocationCard({
  message,
  mine = false,
  user = null,
  profile = null,
  onStopLiveLocation,
}) {
  const currentUid = profile?.uid || auth.currentUser?.uid;
  const { t } = useLanguage();
  const [now, setNow] = useState(() => Date.now());
  const [showMapModal, setShowMapModal] = useState(false);
  const isPermanentlyEnded = Boolean(message?.id) && getPermanentlyEndedLocations().has(message.id);
  const [localEnded, setLocalEnded] = useState(() => isPermanentlyEnded);

  const location = message?.location || {};
  const lat = Number(location.lat);
  const lng = Number(location.lng);
  const hasCoordinates = !isNaN(lat) && !isNaN(lng);

  const isStaticLocation =
    message?.locationType === "location" ||
    (message?.type === "location" && message?.locationType !== "live_location");

  const isLiveType =
    !isStaticLocation &&
    (message?.type === "live_location" ||
      message?.locationType === "live_location" ||
      Boolean(message?.liveUntil));

  const liveUntil = message?.liveUntil ? Number(message.liveUntil) : null;
  const isExpired = liveUntil ? now >= liveUntil : false;
  const isLiveActive =
    !localEnded &&
    !isPermanentlyEnded &&
    isLiveType &&
    message?.isLive !== false &&
    !isExpired;

  const isEnded =
    localEnded ||
    isPermanentlyEnded ||
    message?.isEnded === true ||
    Boolean(message?.endedAt) ||
    message?.isLive === false ||
    (isLiveType && isExpired);


  // Auto-close map modal if it was open when location ended
  useEffect(() => {
    if (isEnded && showMapModal) {
      setShowMapModal(false);
    }
  }, [isEnded, showMapModal]);

  // Sync ended state if message prop is updated to ended in real time
  useEffect(() => {
    if (message.isEnded === true || message.isLive === false || Boolean(message.endedAt)) {
      setLocalEnded(true);
      markLocationPermanentlyEnded(message.id);
    }
  }, [message.id, message.isEnded, message.isLive, message.endedAt]);

  // Clock to refresh remaining time every 3 seconds while live
  useEffect(() => {
    if (!isLiveActive) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 3000);
    return () => clearInterval(interval);
  }, [isLiveActive]);

  const remainingMs = liveUntil ? Math.max(0, liveUntil - now) : 0;
  const timeLeftString = formatRemainingTime(remainingMs);

  // Compute sender indication (You, Consumer, Farmer)
  let senderLabel;
  let senderName;
  let isSenderFarmer = false;

  if (mine) {
    senderLabel = t("messages.senderYou"); // "You" / "Ikaw"
    senderName = profile?.fullname || "";
    isSenderFarmer = profile?.role === "farmer";
  } else {
    // When viewed by the other user:
    // If the sender is a farmer (viewed by consumer): "Farmer"
    // If the sender is a consumer (viewed by farmer): "Consumer"
    if (user?.role === "farmer") {
      senderLabel = t("messages.senderFarmer");
      isSenderFarmer = true;
    } else if (user?.role === "consumer") {
      senderLabel = t("messages.senderConsumer");
      isSenderFarmer = false;
    } else {
      // Inferred from viewer: if viewer is farmer, sender is consumer; vice-versa
      if (profile?.role === "farmer") {
        senderLabel = t("messages.senderConsumer");
        isSenderFarmer = false;
      } else {
        senderLabel = t("messages.senderFarmer");
        isSenderFarmer = true;
      }
    }
    senderName = user?.fullname || user?.username || message.senderName || "";
  }

  // Get receiver's coordinates for preview if available
  const { location: cachedGpsLocation } = useUserLocation(false);
  const receiverCoords = useMemo(() => {
    if (mine) return null;
    if (
      cachedGpsLocation &&
      typeof cachedGpsLocation.lat === "number" &&
      !isNaN(cachedGpsLocation.lat) &&
      typeof cachedGpsLocation.lng === "number" &&
      !isNaN(cachedGpsLocation.lng)
    ) {
      return cachedGpsLocation;
    }
    if (
      profile?.location &&
      typeof profile.location.lat === "number" &&
      !isNaN(profile.location.lat) &&
      typeof profile.location.lng === "number" &&
      !isNaN(profile.location.lng)
    ) {
      return profile.location;
    }
    return null;
  }, [cachedGpsLocation, profile, mine]);

  return (
    <>
      <div
        className={`w-[235px] sm:w-[285px] md:w-[310px] max-w-[310px] min-w-[235px] sm:min-w-[285px] md:min-w-[310px] rounded-2xl overflow-hidden shadow-xs border transition-colors ${
          mine
            ? "bg-(--agri-card) border-(--agri-border)"
            : "bg-(--agri-elevated) border-(--agri-border)"
        }`}
      >
        {/* Header status bar */}
        <div className="px-2.5 py-1.5 sm:px-3 sm:py-2.5 border-b border-(--agri-border-subtle) bg-(--agri-hover)/40 flex flex-col gap-0.5 sm:gap-1">
          <div className="flex items-center justify-between gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              {isLiveActive ? (
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isSenderFarmer ? "bg-emerald-400" : "bg-blue-400"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 ${
                      isSenderFarmer ? "bg-emerald-500" : "bg-blue-500"
                    }`}
                  />
                </span>
              ) : isEnded ? (
                <i className="ri-map-pin-time-line text-neutral-400 text-xs sm:text-sm shrink-0" />
              ) : (
                <i
                  className={`text-xs sm:text-sm shrink-0 ${
                    isSenderFarmer
                      ? "ri-plant-fill text-[#2D6A4F] dark:text-(--agri-brand)"
                      : "ri-map-pin-2-fill text-blue-600"
                  }`}
                />
              )}

              <span className="text-xs sm:text-sm font-bold text-(--agri-text) truncate">
                {senderLabel}
              </span>
            </div>

            <span
              className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-bold shrink-0 ${
                isLiveActive
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                  : isEnded
                    ? "bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                    : isSenderFarmer
                      ? "bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-(--agri-brand)"
                      : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
              }`}
            >
              {isLiveActive
                ? "LIVE"
                : isEnded
                  ? t("messages.locationEndedBadge") || "ENDED"
                  : isSenderFarmer
                    ? t("messages.senderFarmer")
                    : t("messages.senderConsumer")}
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-medium text-(--agri-text-muted) leading-snug">
              {isLiveActive ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Live • {timeLeftString}
                </span>
              ) : isEnded ? (
                <span>
                  {isLiveType
                    ? t("messages.liveLocationEnded")
                    : t("messages.locationEnded")}
                </span>
              ) : (
                <span>{t("messages.sharedLocation")}</span>
              )}
            </p>

            {location.address && !isEnded && (
              <p className="text-[10px] sm:text-xs text-(--agri-text-muted) font-normal mt-0.5 flex items-start gap-1 leading-tight break-words line-clamp-2">
                <i className="ri-map-pin-line text-[10px] sm:text-xs shrink-0 text-[#2D6A4F] dark:text-(--agri-brand) mt-0.5" />
                <span className="break-words [overflow-wrap:anywhere] flex-1">{location.address}</span>
              </p>
            )}

            {location.accuracy != null && isLiveActive && !location.address && (
              <p className="text-[9px] sm:text-[10px] text-(--agri-text-muted) break-words mt-0.5">
                {t("messages.locationAccurateTo", { meters: Math.round(location.accuracy) })}
              </p>
            )}
          </div>
        </div>

        {/* Card Body: Map preview when active, or ended indication when ended */}
        {isEnded ? (
          <div className="w-full h-28 sm:h-36 md:h-40 flex flex-col items-center justify-center p-2.5 sm:p-3.5 text-center bg-neutral-100/90 dark:bg-neutral-800/80 text-(--agri-text-muted) select-none">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-neutral-200/80 dark:bg-neutral-700/60 flex items-center justify-center mb-1 text-neutral-500 dark:text-neutral-400">
              <i className="ri-map-pin-time-line text-lg sm:text-xl" />
            </div>
            <p className="text-[11px] sm:text-xs font-bold text-(--agri-text)">
              {isLiveType
                ? t("messages.liveLocationEnded")
                : t("messages.locationEnded")}
            </p>
            <p className="text-[9px] sm:text-[10px] text-(--agri-text-muted) mt-0.5 max-w-[180px] sm:max-w-[220px] leading-tight">
              {t("messages.locationSharingEndedDesc")}
            </p>
          </div>
        ) : (
          <div className="relative w-full h-28 sm:h-36 md:h-40 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            {hasCoordinates ? (
              <LeafletMapPreview
                lat={lat}
                lng={lng}
                receiverLat={receiverCoords?.lat || null}
                receiverLng={receiverCoords?.lng || null}
                isReceiverFarmer={profile?.role === "farmer"}
                isLiveActive={isLiveActive}
                isLiveType={isLiveType}
                isSenderFarmer={isSenderFarmer}
                onClick={() => setShowMapModal(true)}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-2.5 text-(--agri-text-muted) text-xs">
                <i className="ri-map-pin-line text-xl mb-1" />
                <span className="text-[11px] sm:text-xs">{t("messages.locationUnavailable")}</span>
              </div>
            )}
          </div>
        )}

        {/* Card Footer Actions - Only available when location is active and viewable */}
        {!isEnded && hasCoordinates && (
          <div className="p-1.5 sm:p-2 flex flex-col gap-1 sm:gap-1.5 bg-(--agri-card) border-t border-(--agri-border-subtle)">
            <button
              type="button"
              onClick={() => setShowMapModal(true)}
              className="w-full flex items-center justify-center gap-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold bg-[#2D6A4F]/10 hover:bg-[#2D6A4F]/20 dark:bg-(--agri-brand)/15 dark:hover:bg-(--agri-brand)/25 text-[#2D6A4F] dark:text-(--agri-brand) border border-[#2D6A4F]/20 dark:border-(--agri-brand)/30 transition active:scale-[0.98] cursor-pointer shadow-2xs"
            >
              <i className="ri-map-2-line text-xs sm:text-sm" />
              <span>{t("messages.viewMap")}</span>
            </button>

            {Boolean(
              (mine || (currentUid && (message?.senderId === currentUid || message?.sender?.uid === currentUid))) &&
              (currentUid && (message?.senderId === currentUid || message?.sender?.uid === currentUid))
            ) && (
              <button
                type="button"
                onClick={async () => {
                  markLocationPermanentlyEnded(message.id);
                  setLocalEnded(true);
                  try {
                    await onStopLiveLocation?.(message.id, message.conversationId);
                  } catch (err) {
                    console.error("[LiveLocationCard] Error stopping live location:", err);
                  }
                }}
                className="w-full flex items-center justify-center gap-1 py-1.5 px-2.5 sm:py-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-bold bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 transition cursor-pointer active:scale-[0.98]"
              >
                <i className="ri-stop-circle-line text-xs sm:text-sm" />
                <span>
                  {t("messages.endLiveLocation") ||
                    (isLiveActive ? t("messages.stopSharing") : t("messages.endLocation"))}
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Full Interactive Leaflet Map Modal - only downloaded and opened when requested */}
      {hasCoordinates && !isEnded && showMapModal && (
        <Suspense fallback={null}>
          <LeafletLocationModal
            isOpen={showMapModal}
            onClose={() => setShowMapModal(false)}
            lat={lat}
            lng={lng}
            address={location.address || null}
            accuracy={location.accuracy}
            senderLabel={senderLabel}
            senderName={senderName}
            isSenderFarmer={isSenderFarmer}
            isLiveActive={isLiveActive}
            isLiveType={isLiveType}
            isEnded={isEnded}
            timeLeftString={timeLeftString}
            mine={Boolean(currentUid && (message?.senderId === currentUid || message?.sender?.uid === currentUid))}
            onStopLiveLocation={onStopLiveLocation}
            messageId={message.id}
            conversationId={message.conversationId}
            profile={profile}
            user={user}
          />
        </Suspense>
      )}
    </>
  );
}
