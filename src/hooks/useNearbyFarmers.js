import { useEffect, useMemo, useState } from "react";

import useUserLocation from "./useUserLocation";

import { getFarmers } from "../services/farmer.service";
import { getDistanceKm } from "../utils/distance";

export default function useNearbyFarmers() {
  const {
    location: userLocation,
    loadingLocation,
    refreshLocation,
  } = useUserLocation(true);

  const [loading, setLoading] = useState(true);

  const [farmers, setFarmers] = useState([]);

  const [maxDistance, setMaxDistance] = useState(1);

  useEffect(() => {
    loadFarmers();
  }, []);

  async function loadFarmers() {
    try {
      setLoading(true);

      const data = await getFarmers();

      setFarmers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const nearbyFarmers = useMemo(() => {
    if (!userLocation) return [];

    return farmers
      .map((farmer) => {
        if (
          farmer.location?.lat == null ||
          farmer.location?.lng == null
        ) {
          return null;
        }

        const distance = getDistanceKm(
          userLocation.lat,
          userLocation.lng,
          farmer.location.lat,
          farmer.location.lng
        );

        return {
          ...farmer,
          distance,
        };
      })
      .filter(Boolean)
      .filter((farmer) => farmer.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }, [farmers, userLocation, maxDistance]);

  const nearestFarmer = nearbyFarmers[0] ?? null;

  return {
    loading,
    loadingLocation,

    userLocation,

    farmers,
    nearbyFarmers,

    nearestFarmer,

    maxDistance,
    setMaxDistance,

    refreshLocation,
    reloadFarmers: loadFarmers,
  };
}