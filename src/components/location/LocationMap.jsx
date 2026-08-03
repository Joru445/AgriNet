import Map from "../map/Map";
import { defaultIcon } from "../../constants/MapIcons";

const DEFAULT_CENTER = {
  lat: 13.9411,
  lng: 121.6243,
};

export default function LocationMap({ editing, value, onChange }) {
  const hasLocation = value?.lat != null && value?.lng != null;

  const center = hasLocation ? value : DEFAULT_CENTER;

  return (
    <Map
      center={center}
      editable={editing}
      onLocationChange={onChange}
      markers={
        hasLocation
          ? [
              {
                key: "selected",
                lat: value.lat,
                lng: value.lng,
                icon: defaultIcon,
                draggable: editing,
                popup: "Selected location",
              },
            ]
          : []
      }
    />
  );
}
