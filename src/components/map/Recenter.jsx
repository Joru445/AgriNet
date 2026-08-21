import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function Recenter({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    map.setView([center.lat, center.lng], zoom ?? map.getZoom(), {
      animate: true,
    });
  }, [center, map, zoom]);

  return null;
}
