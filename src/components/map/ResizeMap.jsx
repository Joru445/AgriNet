import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function ResizeMap({ fullscreen }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 350);

    const container = map.getContainer();
    if (!container) return;

    let resizeTimer = null;
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        map.invalidateSize();
      }, 100);
    });

    observer.observe(container);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [fullscreen, map]);

  return null;
}
