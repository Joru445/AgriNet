import { farmerIcon, userIcon } from "../../../constants/MapIcons";

import useStartConversation from "../../../hooks/useStartConversation";

import { useLanguage } from "../../../context/LanguageContext";
import Map from "../../map/Map";
import FarmerPopup from "./FarmerPopup";

const PHILIPPINES_CENTER = { lat: 12.8797, lng: 121.7740 };

export default function NearbyMap({ userLocation, farmers, maxDistance }) {
  const { t } = useLanguage();
  const startConversation = useStartConversation();

  const hasValidUserLocation =
    userLocation &&
    typeof userLocation.lat === "number" &&
    !isNaN(userLocation.lat) &&
    typeof userLocation.lng === "number" &&
    !isNaN(userLocation.lng);

  const firstFarmerWithLocation = (farmers || []).find(
    (f) =>
      f?.location &&
      typeof f.location.lat === "number" &&
      !isNaN(f.location.lat) &&
      typeof f.location.lng === "number" &&
      !isNaN(f.location.lng),
  );

  const mapCenter = hasValidUserLocation
    ? userLocation
    : firstFarmerWithLocation
      ? { lat: firstFarmerWithLocation.location.lat, lng: firstFarmerWithLocation.location.lng }
      : PHILIPPINES_CENTER;

  return (
    <Map
      center={mapCenter}
      zoom={13}
      radius={maxDistance * 1000}
      markers={[
        ...(hasValidUserLocation
          ? [
              {
                key: "user",
                lat: userLocation.lat,
                lng: userLocation.lng,
                icon: userIcon,
                popup: t("nearby.youAreHere"),
              },
            ]
          : []),

        ...(farmers || [])
          .filter(
            (f) =>
              f &&
              f.location &&
              typeof f.location.lat === "number" &&
              !isNaN(f.location.lat) &&
              typeof f.location.lng === "number" &&
              !isNaN(f.location.lng),
          )
          .map((f) => ({
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
