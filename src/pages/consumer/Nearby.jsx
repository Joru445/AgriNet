import useNearbyFarmers from "../../hooks/useNearbyFarmers";

import NearbyHeader from "../../components/nearby/NearbyHeader";
import NearbyMap from "../../components/nearby/NearbyMap";
import NearbyFilters from "../../components/nearby/NearbyFilters";
import NearbyFarmerGrid from "../../components/nearby/NearbyGrid";

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
    <div className="max-w-7xl mx-auto py-8">
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

      <NearbyFarmerGrid
        loading={loading}
        farmers={nearbyFarmers}
      />
    </div>
  );
}