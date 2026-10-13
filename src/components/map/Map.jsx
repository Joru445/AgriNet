import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { useLanguage } from "../../context/LanguageContext";

import Recenter from "./Recenter";
import ResizeMap from "./ResizeMap";

const DEFAULT_CENTER = {
  lat: 13.9411,
  lng: 121.6243,
};

function MapClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      onClick?.(e.latlng);
    },
  });
  return null;
}

function FullscreenControl({ fullscreen, onToggle, label }) {
  const map = useMap();

  useEffect(() => {
    const control = L.control({ position: "topleft" });
    control.onAdd = () => {
      const container = L.DomUtil.create("div", "leaflet-bar agrinet-fullscreen-control");
      const button = L.DomUtil.create("button", "agrinet-map-control", container);
      button.type = "button";
      button.setAttribute("aria-label", label);
      button.title = label;
      button.innerHTML = `<i class="${fullscreen ? "ri-fullscreen-exit-line" : "ri-fullscreen-line"}" aria-hidden="true"></i>`;
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(button, "click", (event) => {
        L.DomEvent.stop(event);
        onToggle();
      });
      return container;
    };
    control.addTo(map);
    return () => control.remove();
  }, [map, fullscreen, label, onToggle]);

  return null;
}

export default function Map({
  onProfile,
  center,
  markers = [],
  radius,
  children,
  zoom = 13,
  className = "w-full h-full border border-gray-200",
  actionButton,
  editable = false,
  onLocationChange,
}) {
  const { t } = useLanguage();
  const isValidCenter =
    center &&
    typeof center.lat === "number" &&
    !isNaN(center.lat) &&
    typeof center.lng === "number" &&
    !isNaN(center.lng);

  const mapCenter = isValidCenter ? center : DEFAULT_CENTER;

  const wrapperRef = useRef(null);

  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    function handleChange() {
      setFullscreen(!!document.fullscreenElement);
    }

    document.addEventListener("fullscreenchange", handleChange);

    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  async function toggleFullscreen() {
    const element = wrapperRef.current;

    if (!document.fullscreenElement) {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  return (
    <div
      ref={wrapperRef}
      className={`relative overflow-hidden bg-(--agri-card) ${
        fullscreen ? "fixed inset-0 z-9995" : "h-80 md:h-96"
      } ${onProfile ? "rounded-xl" : "rounded-none"}`}
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom}
        className={className}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ResizeMap fullscreen={fullscreen} />
        <FullscreenControl
          fullscreen={fullscreen}
          onToggle={toggleFullscreen}
          label={t(fullscreen ? "map.exitFullscreen" : "map.enterFullscreen")}
        />

        <Recenter center={mapCenter} zoom={zoom} />

        {radius && (
          <Circle
            center={[mapCenter.lat, mapCenter.lng]}
            radius={radius}
            pathOptions={{
              color: "#2D6A4F",
              fillColor: "#2D6A4F",
              fillOpacity: 0.12,
            }}
          />
        )}

        {markers
          .filter(
            (marker) =>
              marker &&
              typeof marker.lat === "number" &&
              !isNaN(marker.lat) &&
              typeof marker.lng === "number" &&
              !isNaN(marker.lng),
          )
          .map((marker) => (
            <Marker
              key={marker.key}
              position={[marker.lat, marker.lng]}
              icon={marker.icon}
              draggable={marker.draggable}
              eventHandlers={marker.eventHandlers}
            >
              {marker.popup && <Popup>{marker.popup}</Popup>}
            </Marker>
          ))}

        {children}
        {editable && onLocationChange && (
          <MapClickHandler onClick={onLocationChange} />
        )}
      </MapContainer>

      {actionButton && (
        <div className="absolute top-3 right-3 z-9995">{actionButton}</div>
      )}
    </div>
  );
}
