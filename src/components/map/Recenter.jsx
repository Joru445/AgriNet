import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function Recenter({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    map.setView([center.lat, center.lng], map.getZoom(), {
      animate: true,
    });
  }, [center, map]);

  return null;
}
