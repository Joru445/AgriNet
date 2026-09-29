import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

export default function Recenter({ center, zoom }) {
  const map = useMap();
  const prevRef = useRef({ lat: null, lng: null, zoom: null });

  useEffect(() => {
    if (!center || typeof center.lat !== "number" || typeof center.lng !== "number") return;
    const targetZoom = zoom ?? map.getZoom();

    if (
      prevRef.current.lat === center.lat &&
      prevRef.current.lng === center.lng &&
      prevRef.current.zoom === targetZoom
    ) {
      return;
    }

    prevRef.current = { lat: center.lat, lng: center.lng, zoom: targetZoom };
    map.setView([center.lat, center.lng], targetZoom, {
      animate: true,
    });
  }, [center?.lat, center?.lng, map, zoom]);

  return null;
}
