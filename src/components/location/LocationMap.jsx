import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import { reverseGeocode } from "../../utils/location";

import marker2x from "leaflet/dist/images/marker-icon-2x.png";
import marker from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker,
  shadowUrl: shadow,
});

const DEFAULT_CENTER = {
  lat: 13.9411,
  lng: 121.6243,
};

function Recenter({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center?.lat == null || center?.lng == null) return;

    map.setView([center.lat, center.lng], map.getZoom(), {
      animate: true,
    });
  }, [center, map]);

  return null;
}

function ClickHandler({ editing, onChange }) {
  useMapEvents({
    async click(e) {
      if (!editing) return;

      const { lat, lng } = e.latlng;

      let address = "";

      try {
        address = await reverseGeocode(lat, lng);
      } catch (error) {
        console.error(error);
      }

      onChange({
        lat,
        lng,
        address,
      });
    },
  });

  return null;
}

export default function LocationMap({ editing, value, onChange }) {
  const hasLocation = value?.lat != null && value?.lng != null;

  const center = hasLocation ? value : DEFAULT_CENTER;

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={15}
      dragging={editing}
      scrollWheelZoom={editing}
      doubleClickZoom={editing}
      touchZoom={editing}
      boxZoom={editing}
      keyboard={editing}
      className="h-80 w-full rounded-2xl border border-gray-200"
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Recenter center={center} />

      <ClickHandler editing={editing} onChange={onChange} />

      {hasLocation && (
        <Marker
          draggable={editing}
          position={[value.lat, value.lng]}
          eventHandlers={{
            async dragend(e) {
              if (!editing) return;

              const pos = e.target.getLatLng();

              let address = "";

              try {
                address = await reverseGeocode(pos.lat, pos.lng);
              } catch (error) {
                console.error(error);
              }

              onChange({
                lat: pos.lat,
                lng: pos.lng,
                address,
              });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
