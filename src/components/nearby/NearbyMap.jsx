import { farmerIcon, userIcon } from "../../constants/MapIcons";

import useStartConversation from "../../hooks/useStartConversation";

import Map from "../map/Map";
import FarmerPopup from "./FarmerPopup";

export default function NearbyMap({ userLocation, farmers, maxDistance }) {
  const startConversation = useStartConversation();

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
            <FarmerPopup farmer={f} onMessage={() => startConversation(f)} />
          ),
        })),
      ]}
    />
  );
}
