import { farmerIcon, userIcon } from "../../data/MapIcons";

import Map from "../map/Map";

export default function NearbyMap({ userLocation, farmers, maxDistance }) {
  return (
    <Map
      center={userLocation}
      radius={maxDistance * 1000}
      markers={[
        ...(userLocation
          ? [
              {
                key: "user",
                lat: userLocation.lat,
                lng: userLocation.lng,
                icon: userIcon,
                popup: "You are here",
              },
            ]
          : []),

        ...farmers.map((f) => ({
          key: f.uid,
          lat: f.location.lat,
          lng: f.location.lng,
          icon: farmerIcon,
          popup: (
            <>
              <strong>{f.fullname}</strong>
              <br />
              {f.distance.toFixed(1)} km away
            </>
          ),
        })),
      ]}
    />
  );
}
