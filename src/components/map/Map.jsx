import { useEffect, useRef, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import Recenter from "./Recenter";
import ResizeMap from "./ResizeMap";

const DEFAULT_CENTER = {
  lat: 13.9411,
  lng: 121.6243,
};

export default function Map({
  onProfile,
  center,
  markers = [],
  radius,
  children,
  className = "w-full h-full border border-gray-200",
}) {
  const mapCenter = center ?? DEFAULT_CENTER;

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
      className={`relative overflow-hidden bg-white ${
        fullscreen ? "fixed inset-0 z-9997" : "h-80 md:h-96"
      } ${onProfile ? "rounded-xl" : " "}`}
    >
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={15}
        className={className}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ResizeMap fullscreen={fullscreen} />

        <Recenter center={mapCenter} />

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

        {markers.map((marker) => (
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
      </MapContainer>

      <button
        type="button"
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 z-9997 w-10 h-10 rounded-sm bg-white/95 shadow-lg border-2 border-gray-400 hover:bg-gray-100"
      >
        <i
          className={
            fullscreen
              ? "ri-fullscreen-exit-line text-lg"
              : "ri-fullscreen-line text-lg"
          }
        />
      </button>
    </div>
  );
}
