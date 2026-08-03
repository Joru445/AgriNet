import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function ResizeMap({ fullscreen }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [fullscreen, map]);

  return null;
}
