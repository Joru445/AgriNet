import { useCallback, useEffect, useMemo, useState } from "react";

import useUserLocation from "./useUserLocation";
import { useAuth } from "../context/AuthContext";

import { getFarmers } from "../services/farmer.service";
import * as pageCache from "../utils/pageCache";

const CACHE_KEY_PREFIX = "nearbyFarmers";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function useNearbyFarmers() {
  const { profile } = useAuth();
  const {
    location: gpsLocation,
    loadingLocation,
    refreshLocation,
  } = useUserLocation(true);

  const validUserLocation = useMemo(() => {
    if (
      gpsLocation &&
      typeof gpsLocation.lat === "number" &&
      !isNaN(gpsLocation.lat) &&
      typeof gpsLocation.lng === "number" &&
      !isNaN(gpsLocation.lng)
    ) {
      return gpsLocation;
    }

    if (
      profile?.location &&
      typeof profile.location.lat === "number" &&
      !isNaN(profile.location.lat) &&
      typeof profile.location.lng === "number" &&
      !isNaN(profile.location.lng)
    ) {
      return profile.location;
    }

    return { lat: 13.9411, lng: 121.6243 };
  }, [gpsLocation, profile]);

  const [loading, setLoading] = useState(false);
  const [farmers, setFarmers] = useState(() => {
    const cacheKey = `${CACHE_KEY_PREFIX}_${validUserLocation.lat}_${validUserLocation.lng}`;
    return pageCache.get(cacheKey) ?? [];
  });

  const [maxDistance, setMaxDistanceState] = useState(() => {
    const stored = localStorage.getItem("agri_nearby_distance");
    return stored ? Number(stored) : 3;
  });

  const setMaxDistance = (dist) => {
    const val = Number(dist) || 3;
    localStorage.setItem("agri_nearby_distance", String(val));
    setMaxDistanceState(val);
  };

  useEffect(() => {
    const stored = localStorage.getItem("agri_nearby_distance");
    if (stored) {
      setMaxDistanceState(Number(stored));
    }
  }, []);

  // Build a cache key that includes location + distance so different
  // queries are cached independently.
  const cacheKey = `${CACHE_KEY_PREFIX}_${validUserLocation.lat}_${validUserLocation.lng}_${maxDistance}`;

  const loadFarmers = useCallback(async () => {
    const cached = pageCache.get(cacheKey);
    if (cached) {
      setFarmers(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { farmers: data } = await getFarmers({
        hasProducts: true,
        lat: validUserLocation.lat,
        lng: validUserLocation.lng,
        maxDistance,
      });

      setFarmers(data);
      pageCache.set(cacheKey, data, CACHE_TTL);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [validUserLocation.lat, validUserLocation.lng, maxDistance, cacheKey]);

  useEffect(() => {
    loadFarmers();
  }, [loadFarmers]);

  const nearestFarmer = farmers[0] ?? null;

  return {
    loading,
    loadingLocation,

    userLocation: validUserLocation,

    farmers,

    nearestFarmer,

    maxDistance,
    setMaxDistance,

    refreshLocation,
    reloadFarmers: () => {
      pageCache.invalidate(cacheKey);
      loadFarmers();
    },
  };
}
