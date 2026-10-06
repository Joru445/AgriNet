import Map from "../map/Map";
import { defaultIcon } from "../../constants/MapIcons";
import { reverseGeocode } from "../../utils/location";

const DEFAULT_CENTER = {
  lat: 13.9411,
  lng: 121.6243,
};

export default function LocationMap({ editing, value, onProfile, onChange, actionButton }) {
  const hasLocation = value?.lat != null && value?.lng != null;

  const center = hasLocation ? value : DEFAULT_CENTER;

  async function handleMapClick(latlng) {
    if (!editing || !onChange) return;
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    onChange({
      lat: latlng.lat,
      lng: latlng.lng,
      address,
    });
  }

  async function handleMarkerDragEnd(e) {
    if (!editing || !onChange) return;
    const marker = e.target;
    const latlng = marker.getLatLng();
    const address = await reverseGeocode(latlng.lat, latlng.lng);
    onChange({
      lat: latlng.lat,
      lng: latlng.lng,
      address,
    });
  }

  return (
    <Map
      onProfile={onProfile}
      center={center}
      editable={editing}
      onLocationChange={handleMapClick}
      actionButton={actionButton}
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
                eventHandlers: editing
                  ? {
                      dragend: handleMarkerDragEnd,
                    }
                  : undefined,
              },
            ]
          : []
      }
    />
  );
}
