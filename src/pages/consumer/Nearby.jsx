import useNearbyFarmers from "../../hooks/useNearbyFarmers";

import NearbyHeader from "../../components/consumer/nearby/NearbyHeader";
import NearbyMap from "../../components/consumer/nearby/NearbyMap";
import NearbyFilters from "../../components/consumer/nearby/NearbyFilters";
import NearbyFarmerGrid from "../../components/consumer/nearby/NearbyGrid";

export default function Nearby() {
  const {
    loading,
    userLocation,
    maxDistance,
    farmers,
    nearestFarmer,

    setMaxDistance,
  } = useNearbyFarmers();

  return (
    <main className="max-w-6xl mx-auto pb-4">
      <NearbyHeader />

      <NearbyMap
        farmers={farmers}
        maxDistance={maxDistance}
        userLocation={userLocation}
      />

      <NearbyFilters
        distance={maxDistance}
        nearestFarmer={nearestFarmer}
        onDistanceChange={setMaxDistance}
      />

      <NearbyFarmerGrid loading={loading} farmers={farmers} />
    </main>
  );
}
