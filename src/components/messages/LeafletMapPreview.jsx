import { useEffect, useRef } from "react";
import L from "leaflet";

export default function LeafletMapPreview({
  lat,
  lng,
  receiverLat = null,
  receiverLng = null,
  isReceiverFarmer = false,
  isLiveActive = false,
  isLiveType = false,
  isSenderFarmer = false,
  onClick = null,
  className = "w-full h-36 sm:h-40",
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const receiverMarkerRef = useRef(null);

  // Generate sender marker icon based on role and live state
  const createIcon = () => {
    if (isLiveActive) {
      const bgColor = isSenderFarmer ? "#2D6A4F" : "#2563EB";
      const ringColor = isSenderFarmer ? "rgba(45, 106, 79, 0.4)" : "rgba(37, 99, 235, 0.4)";
      const iconClass = isSenderFarmer ? "ri-plant-line" : "ri-user-line";

      return new L.DivIcon({
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; transform: translate(-20px, -20px);">
            <span style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background-color: ${ringColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
            <div style="position: relative; width: 30px; height: 30px; border-radius: 9999px; background-color: ${bgColor}; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center; color: white;">
              <i class="${iconClass}" style="font-size: 15px;"></i>
            </div>
          </div>
        `,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [0, 0],
      });
    }

    if (isSenderFarmer) {
      return new L.DivIcon({
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transform: translate(-16px, -16px);">
            <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: #2D6A4F; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white;">
              <i class="ri-plant-line" style="font-size: 14px;"></i>
            </div>
          </div>
        `,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [0, 0],
      });
    }

    return new L.DivIcon({
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transform: translate(-16px, -16px);">
          <div style="width: 28px; height: 28px; border-radius: 9999px; background-color: #2563EB; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white;">
            <i class="ri-user-line" style="font-size: 14px;"></i>
          </div>
        </div>
      `,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [0, 0],
    });
  };

  // Generate receiver ("You") mini marker icon
  const createReceiverIcon = () => {
    const bgColor = isReceiverFarmer ? "#2D6A4F" : "#2563EB";
    const iconClass = isReceiverFarmer ? "ri-plant-fill" : "ri-user-fill";

    return new L.DivIcon({
      html: `
        <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; transform: translate(-15px, -15px);">
          <div style="width: 26px; height: 26px; border-radius: 9999px; background-color: #111827; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <i class="${iconClass}" style="font-size: 13px; color: ${bgColor === '#2D6A4F' ? '#4ade80' : '#60a5fa'};"></i>
          </div>
        </div>
      `,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [0, 0],
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;

    if (container._leaflet_id) {
      container._leaflet_id = null;
    }

    const hasReceiver = receiverLat != null && receiverLng != null && !isNaN(receiverLat) && !isNaN(receiverLng);

    const map = L.map(container, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    });

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      icon: createIcon(),
      interactive: false,
    }).addTo(map);
    markerRef.current = marker;

    if (hasReceiver) {
      const rMarker = L.marker([receiverLat, receiverLng], {
        icon: createReceiverIcon(),
        interactive: false,
      }).addTo(map);
      receiverMarkerRef.current = rMarker;

      const bounds = L.latLngBounds([
        [lat, lng],
        [receiverLat, receiverLng],
      ]);
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
    }

    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch {
          // ignore already removed
        }
        mapRef.current = null;
      }
      markerRef.current = null;
      receiverMarkerRef.current = null;
      if (container) {
        container._leaflet_id = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map coordinates and markers without reinitializing Leaflet
  useEffect(() => {
    if (!mapRef.current || lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;

    const hasReceiver = receiverLat != null && receiverLng != null && !isNaN(receiverLat) && !isNaN(receiverLng);

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      markerRef.current.setIcon(createIcon());
    }

    if (hasReceiver) {
      if (!receiverMarkerRef.current) {
        const rMarker = L.marker([receiverLat, receiverLng], {
          icon: createReceiverIcon(),
          interactive: false,
        }).addTo(mapRef.current);
        receiverMarkerRef.current = rMarker;
      } else {
        receiverMarkerRef.current.setLatLng([receiverLat, receiverLng]);
        receiverMarkerRef.current.setIcon(createReceiverIcon());
      }

      const bounds = L.latLngBounds([
        [lat, lng],
        [receiverLat, receiverLng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
    } else {
      mapRef.current.setView([lat, lng], 15, { animate: true });
      if (receiverMarkerRef.current) {
        try {
          receiverMarkerRef.current.remove();
        } catch {
          // ignore
        }
        receiverMarkerRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refs are stable, deps intentionally curated
  }, [lat, lng, receiverLat, receiverLng, isLiveActive, isLiveType, isSenderFarmer, isReceiverFarmer]);

  const hasReceiver = receiverLat != null && receiverLng != null && !isNaN(receiverLat) && !isNaN(receiverLng);

  return (
    <div className={`relative ${className} overflow-hidden bg-neutral-100 dark:bg-neutral-800`}>
      <div ref={containerRef} className="w-full h-full z-0" />
      {onClick && (
        <button
          type="button"
          onClick={onClick}
          className="absolute inset-0 z-10 w-full h-full cursor-pointer group"
          title="Click to view map"
          aria-label="Click to view map"
        >
          <div className="absolute top-2 left-2 z-20 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-xs text-white text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
            <i className="ri-fullscreen-line text-xs" />
            <span>View Map</span>
          </div>

          {hasReceiver && (
            <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white pointer-events-none">
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isSenderFarmer ? "bg-emerald-400" : "bg-blue-400"}`} />
                <span>{isSenderFarmer ? "Farmer" : "Consumer"}</span>
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>You</span>
              </span>
            </div>
          )}
        </button>
      )}
      <div className="absolute bottom-1 right-1.5 z-20 bg-white/70 dark:bg-black/60 backdrop-blur-2xs px-1 rounded text-[9px] text-neutral-500 pointer-events-none">
        © OpenStreetMap
      </div>
    </div>
  );
}
