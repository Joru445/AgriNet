import { useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import L from "leaflet";
import { useLanguage } from "../../../context/LanguageContext";
import useUserLocation from "../../../hooks/useUserLocation";
import {
  getPermanentlyEndedLocations,
  markLocationPermanentlyEnded,
} from "../../../utils/endedLocations";

export default function LeafletLocationModal({
  isOpen,
  onClose,
  lat,
  lng,
  address = null,
  accuracy = null,
  senderLabel = "Location",
  senderName = "",
  isSenderFarmer = false,
  isLiveActive = false,
  isLiveType = false,
  isEnded = false,
  timeLeftString = "",
  mine = false,
  onStopLiveLocation,
  messageId,
  conversationId = null,
  profile = null,
  user = null,
}) {
  const { t } = useLanguage();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const receiverMarkerRef = useRef(null);
  const receiverCircleRef = useRef(null);

  // Receiver identity and role
  const isReceiverFarmer = profile?.role === "farmer";
  const receiverRoleLabel = isReceiverFarmer
    ? t("messages.senderFarmer")
    : t("messages.senderConsumer");

  // Retrieve receiver's live / cached location
  const {
    location: gpsLocation,
    loadingLocation,
  } = useUserLocation(isOpen);

  // Auto-close modal when location is marked ended
  useEffect(() => {
    if (isEnded && isOpen) {
      onClose();
    }
  }, [isEnded, isOpen, onClose]);

  const receiverCoords = useMemo(() => {
    if (mine) return null;
    if (
      gpsLocation &&
      typeof gpsLocation.lat === "number" &&
      !isNaN(gpsLocation.lat) &&
      typeof gpsLocation.lng === "number" &&
      !isNaN(gpsLocation.lng)
    ) {
      return {
        lat: gpsLocation.lat,
        lng: gpsLocation.lng,
        accuracy: gpsLocation.accuracy || null,
      };
    }
    if (
      profile?.location &&
      typeof profile.location.lat === "number" &&
      !isNaN(profile.location.lat) &&
      typeof profile.location.lng === "number" &&
      !isNaN(profile.location.lng)
    ) {
      return {
        lat: profile.location.lat,
        lng: profile.location.lng,
        accuracy: null,
      };
    }
    return null;
  }, [mine, gpsLocation, profile]);

  const hasBoth = Boolean(!mine && receiverCoords && lat != null && lng != null);

  // Calculate distance between sender and receiver
  const distanceMeters = useMemo(() => {
    if (!hasBoth) return null;
    try {
      return L.latLng(lat, lng).distanceTo(
        L.latLng(receiverCoords.lat, receiverCoords.lng)
      );
    } catch {
      return null;
    }
  }, [hasBoth, lat, lng, receiverCoords]);

  const formattedDistance = useMemo(() => {
    if (distanceMeters == null) return null;
    if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }, [distanceMeters]);

  // Create Sender Marker Icon with role badge
  const createSenderIcon = () => {
    const bgColor = isSenderFarmer ? "#2D6A4F" : "#2563EB";
    const ringColor = isSenderFarmer ? "rgba(45, 106, 79, 0.4)" : "rgba(37, 99, 235, 0.4)";
    const iconClass = isSenderFarmer ? "ri-plant-line" : "ri-user-line";

    return new L.DivIcon({
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); pointer-events: auto;">
          <div style="background-color: ${bgColor}; color: #ffffff; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 3px 6px rgba(0,0,0,0.3); margin-bottom: 3px; white-space: nowrap; border: 1.5px solid white; display: flex; align-items: center; gap: 4px;">
            ${isLiveActive ? '<span style="width: 6px; height: 6px; border-radius: 9999px; background: #ffffff; animation: ping 1.2s infinite;"></span>' : ""}
            <span>${senderLabel}</span>
          </div>
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            ${isLiveActive ? `<span style="position: absolute; width: 44px; height: 44px; border-radius: 9999px; background-color: ${ringColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>` : ""}
            <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background-color: ${bgColor}; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <i class="${iconClass}" style="font-size: 15px;"></i>
            </div>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid ${bgColor}; margin-top: -1px;"></div>
        </div>
      `,
      className: "!overflow-visible",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  // Create Receiver ("You") Marker Icon with "You" badge
  const createReceiverIcon = () => {
    const bgColor = isReceiverFarmer ? "#2D6A4F" : "#2563EB";
    const iconClass = isReceiverFarmer ? "ri-plant-fill" : "ri-user-fill";

    return new L.DivIcon({
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); pointer-events: auto;">
          <div style="background-color: #111827; color: #ffffff; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 3px 6px rgba(0,0,0,0.35); margin-bottom: 3px; white-space: nowrap; border: 1.5px solid white; display: flex; align-items: center; gap: 4px;">
            <span style="width: 6px; height: 6px; border-radius: 9999px; background: #10B981;"></span>
            <span>${t("messages.senderYou")} (${receiverRoleLabel})</span>
          </div>
          <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background-color: ${bgColor}; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <i class="${iconClass}" style="font-size: 15px;"></i>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid ${bgColor}; margin-top: -1px;"></div>
        </div>
      `,
      className: "!overflow-visible",
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container || lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;

    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    const map = L.map(container, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
    });

    mapRef.current = map;

    // Add zoom control at bottom-left corner so it never collides with top controls
    L.control.zoom({ position: "bottomleft" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // Sender Accuracy Circle
    if (accuracy && accuracy > 0) {
      const circle = L.circle([lat, lng], {
        radius: accuracy,
        color: isSenderFarmer ? "#2D6A4F" : "#2563EB",
        fillColor: isSenderFarmer ? "#2D6A4F" : "#2563EB",
        fillOpacity: 0.12,
        weight: 1.5,
      }).addTo(map);
      circleRef.current = circle;
    }

    // Sender Marker with popup
    const marker = L.marker([lat, lng], {
      icon: createSenderIcon(),
    }).addTo(map);

    markerRef.current = marker;

    const statusText = isLiveActive
      ? `● Live • ${timeLeftString} left`
      : isLiveType
        ? "Live location ended"
        : "Shared Location";

    const senderPopupHtml = `
      <div style="text-align: center; padding: 4px 6px; font-family: inherit;">
        <div style="font-size: 13px; font-weight: 700; color: #111;">${senderLabel}</div>
        ${senderName && senderName !== senderLabel ? `<div style="font-size: 11px; color: #666; margin-top: 1px;">${senderName}</div>` : ""}
        <div style="margin-top: 4px; font-size: 10px; font-weight: 700; color: ${isLiveActive ? "#059669" : "#6B7280"};">
          ${statusText}
        </div>
      </div>
    `;

    marker.bindPopup(senderPopupHtml, { autoClose: false, closeOnClick: false }).openPopup();

    // If receiver coordinates already available, add receiver marker and fit bounds
    if (!mine && receiverCoords) {
      const rMarker = L.marker([receiverCoords.lat, receiverCoords.lng], {
        icon: createReceiverIcon(),
      }).addTo(map);

      const receiverPopupHtml = `
        <div style="text-align: center; padding: 4px 6px; font-family: inherit;">
          <div style="font-size: 13px; font-weight: 700; color: #111;">${t("messages.senderYou")} (${receiverRoleLabel})</div>
          ${profile?.fullname ? `<div style="font-size: 11px; color: #666; margin-top: 1px;">${profile.fullname}</div>` : ""}
          <div style="margin-top: 4px; font-size: 10px; font-weight: 700; color: #059669;">
            ● ${t("messages.yourLocation")}
          </div>
        </div>
      `;
      rMarker.bindPopup(receiverPopupHtml);
      receiverMarkerRef.current = rMarker;

      if (receiverCoords.accuracy && receiverCoords.accuracy > 0) {
        const rCircle = L.circle([receiverCoords.lat, receiverCoords.lng], {
          radius: receiverCoords.accuracy,
          color: isReceiverFarmer ? "#2D6A4F" : "#2563EB",
          fillColor: isReceiverFarmer ? "#2D6A4F" : "#2563EB",
          fillOpacity: 0.08,
          weight: 1,
        }).addTo(map);
        receiverCircleRef.current = rCircle;
      }

      const bounds = L.latLngBounds([
        [lat, lng],
        [receiverCoords.lat, receiverCoords.lng],
      ]);
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
    }

    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          // ignore
        }
        mapRef.current = null;
      }
      markerRef.current = null;
      circleRef.current = null;
      receiverMarkerRef.current = null;
      receiverCircleRef.current = null;
      if (container) {
        container._leaflet_id = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Update sender position if coordinates change while modal is open
  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(createSenderIcon());
    }

    if (circleRef.current) {
      circleRef.current.setLatLng([lat, lng]);
      if (accuracy) circleRef.current.setRadius(accuracy);
    }
  }, [lat, lng, accuracy, isLiveActive, isLiveType, senderLabel, isSenderFarmer]);

  // Handle dynamic arrival or update of receiver location
  useEffect(() => {
    if (!mapRef.current || mine || !receiverCoords) return;

    if (!receiverMarkerRef.current) {
      const rMarker = L.marker([receiverCoords.lat, receiverCoords.lng], {
        icon: createReceiverIcon(),
      }).addTo(mapRef.current);

      const receiverPopupHtml = `
        <div style="text-align: center; padding: 4px 6px; font-family: inherit;">
          <div style="font-size: 13px; font-weight: 700; color: #111;">${t("messages.senderYou")} (${receiverRoleLabel})</div>
          ${profile?.fullname ? `<div style="font-size: 11px; color: #666; margin-top: 1px;">${profile.fullname}</div>` : ""}
          <div style="margin-top: 4px; font-size: 10px; font-weight: 700; color: #059669;">
            ● ${t("messages.yourLocation")}
          </div>
        </div>
      `;
      rMarker.bindPopup(receiverPopupHtml);
      receiverMarkerRef.current = rMarker;

      if (receiverCoords.accuracy && receiverCoords.accuracy > 0) {
        const rCircle = L.circle([receiverCoords.lat, receiverCoords.lng], {
          radius: receiverCoords.accuracy,
          color: isReceiverFarmer ? "#2D6A4F" : "#2563EB",
          fillColor: isReceiverFarmer ? "#2D6A4F" : "#2563EB",
          fillOpacity: 0.08,
          weight: 1,
        }).addTo(mapRef.current);
        receiverCircleRef.current = rCircle;
      }

      if (lat != null && lng != null) {
        const bounds = L.latLngBounds([
          [lat, lng],
          [receiverCoords.lat, receiverCoords.lng],
        ]);
        mapRef.current.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
      }
    } else {
      receiverMarkerRef.current.setLatLng([receiverCoords.lat, receiverCoords.lng]);
      receiverMarkerRef.current.setIcon(createReceiverIcon());
      if (receiverCircleRef.current) {
        receiverCircleRef.current.setLatLng([receiverCoords.lat, receiverCoords.lng]);
        if (receiverCoords.accuracy) {
          receiverCircleRef.current.setRadius(receiverCoords.accuracy);
        }
      }
    }
  }, [receiverCoords, mine, isReceiverFarmer, receiverRoleLabel, lat, lng, profile?.fullname]);

  // Recenter / view switchers
  const handleFitBoth = () => {
    if (mapRef.current && hasBoth) {
      const bounds = L.latLngBounds([
        [lat, lng],
        [receiverCoords.lat, receiverCoords.lng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [70, 70], maxZoom: 16 });
    }
  };

  const handleFocusSender = () => {
    if (mapRef.current && lat != null && lng != null) {
      mapRef.current.setView([lat, lng], 16, { animate: true });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  const handleFocusReceiver = () => {
    if (mapRef.current && receiverCoords) {
      mapRef.current.setView([receiverCoords.lat, receiverCoords.lng], 16, { animate: true });
      if (receiverMarkerRef.current) {
        receiverMarkerRef.current.openPopup();
      }
    }
  };

  const handleRecenter = () => {
    if (hasBoth) {
      handleFitBoth();
    } else {
      handleFocusSender();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md sm:max-w-lg bg-(--agri-card) border border-(--agri-border) rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-start sm:items-center justify-between gap-3 border-b border-(--agri-border-subtle) bg-(--agri-hover)/30">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0 mt-0.5 sm:mt-0 ${
                isSenderFarmer ? "bg-[#2D6A4F]" : "bg-blue-600"
              }`}
            >
              <i className={isSenderFarmer ? "ri-plant-line text-base sm:text-lg" : "ri-user-line text-base sm:text-lg"} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-(--agri-text)">
                  {senderLabel}
                </h3>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    isLiveActive
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                      : isSenderFarmer
                        ? "bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-(--agri-brand)"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300"
                  }`}
                >
                  {isLiveActive ? "LIVE" : isSenderFarmer ? "Farmer" : "Consumer"}
                </span>

                {formattedDistance && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    {t("messages.awayFromYou", { distance: formattedDistance })}
                  </span>
                )}
              </div>

              <p className="text-xs text-(--agri-text-muted) mt-0.5 leading-snug break-words">
                {address
                  ? address
                  : isLiveActive
                    ? t("messages.sharingLiveTimeLeft", { time: timeLeftString })
                    : isLiveType
                      ? t("messages.liveLocationEnded")
                      : t("messages.sharedLocation")}
              </p>
              {hasBoth && (
                <p className="text-[11px] text-(--agri-text-muted)/80 mt-0.5 flex items-center gap-1 leading-tight">
                  <i className="ri-user-location-line text-xs shrink-0 text-blue-500" />
                  <span>{`${t("messages.yourLocation")}: ${t("messages.senderYou")} (${receiverRoleLabel})`}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-(--agri-text-muted) hover:text-(--agri-text) hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer shrink-0"
            aria-label="Close"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        {/* Leaflet Map Body */}
        <div className="relative w-full h-[290px] sm:h-[340px] bg-neutral-100 dark:bg-neutral-800">
          <div ref={containerRef} className="w-full h-full z-0" />

          {/* Floating Navigation Controls when both locations are visible */}
          {hasBoth && (
            <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-[400] flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-white/95 dark:bg-neutral-900/95 shadow-md border border-(--agri-border) backdrop-blur-xs text-xs font-semibold max-w-[calc(100%-3.5rem)]">
              <button
                type="button"
                onClick={handleFitBoth}
                className="px-2 sm:px-2.5 py-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-(--agri-text) transition flex items-center gap-1 shrink-0 cursor-pointer"
                title={t("messages.showBoth")}
              >
                <i className="ri-fullscreen-line text-sm text-(--agri-text-muted)" />
                <span className="hidden sm:inline">{t("messages.showBoth")}</span>
              </button>

              <span className="h-4 w-px bg-(--agri-border) shrink-0" />

              <button
                type="button"
                onClick={handleFocusSender}
                className="px-2 sm:px-2.5 py-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-(--agri-text) transition flex items-center gap-1.5 min-w-0 cursor-pointer"
                title={senderLabel}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isSenderFarmer ? "bg-[#2D6A4F]" : "bg-blue-600"
                  }`}
                />
                <span className="truncate max-w-[70px] sm:max-w-none">{senderLabel}</span>
              </button>

              <span className="h-4 w-px bg-(--agri-border) shrink-0" />

              <button
                type="button"
                onClick={handleFocusReceiver}
                className="px-2 sm:px-2.5 py-1 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-(--agri-text) transition flex items-center gap-1.5 min-w-0 cursor-pointer"
                title={t("messages.senderYou")}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isReceiverFarmer ? "bg-[#2D6A4F]" : "bg-blue-600"
                  }`}
                />
                <span className="truncate max-w-[70px] sm:max-w-none">{t("messages.senderYou")}</span>
              </button>
            </div>
          )}

          {/* Locating feedback when still fetching receiver location */}
          {loadingLocation && !hasBoth && !mine && (
            <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 z-[400] px-2.5 py-1 rounded-xl bg-white/90 dark:bg-neutral-900/90 shadow-md border border-(--agri-border) text-[11px] text-(--agri-text-muted) flex items-center gap-1.5 max-w-[calc(100%-3.5rem)] truncate">
              <i className="ri-loader-4-line animate-spin text-xs text-[#2D6A4F]" />
              <span className="truncate">{t("messages.locatingYou")}</span>
            </div>
          )}

          {/* Recenter Button on top-right */}
          <button
            type="button"
            onClick={handleRecenter}
            className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 z-[400] w-9 h-9 rounded-xl bg-white/95 dark:bg-neutral-900/95 text-(--agri-text) shadow-md border border-(--agri-border) flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer"
            title={hasBoth ? t("messages.showBoth") : "Recenter Map"}
          >
            <i className="ri-crosshair-2-line text-base text-[#2D6A4F] dark:text-(--agri-brand)" />
          </button>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-(--agri-border-subtle) flex items-center justify-between bg-(--agri-card)">
          <div className="text-xs text-(--agri-text-muted) flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <i className="ri-map-pin-line text-sm" />
              <span>
                {accuracy
                  ? t("messages.locationAccurateTo", { meters: Math.round(accuracy) })
                  : `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
              </span>
            </span>
            {hasBoth && (
              <span className="text-(--agri-text-muted)/70">
                • {formattedDistance ? `${formattedDistance} apart` : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {mine && !isEnded && !(messageId && getPermanentlyEndedLocations().has(messageId)) && (
              <button
                type="button"
                onClick={() => {
                  if (messageId) {
                    markLocationPermanentlyEnded(messageId);
                  }
                  onStopLiveLocation?.(messageId, conversationId);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-2xs active:scale-[0.98]"
              >
                <i className="ri-stop-circle-line text-sm" />
                <span>
                  {t("messages.endLiveLocation") ||
                    (isLiveActive ? t("messages.stopSharing") : t("messages.endLocation"))}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2D6A4F] text-white hover:bg-[#1B4332] dark:bg-(--agri-brand) dark:hover:bg-(--agri-brand-dark) transition shadow-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
