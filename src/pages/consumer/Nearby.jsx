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
    nearbyFarmers,
    nearestFarmer,

    setMaxDistance,
  } = useNearbyFarmers();

  return (
    <main className="max-w-6xl mx-auto pb-16 md:pb-4">
      <NearbyHeader />

      <NearbyMap
        farmers={nearbyFarmers}
        maxDistance={maxDistance}
        userLocation={userLocation}
      />

      <NearbyFilters
        distance={maxDistance}
        nearestFarmer={nearestFarmer}
        onDistanceChange={setMaxDistance}
      />

      <NearbyFarmerGrid loading={loading} farmers={nearbyFarmers} />
    </main>
  );
}
