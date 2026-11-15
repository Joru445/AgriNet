import { useCallback, useEffect, useMemo, useState } from "react";

import useUserLocation from "./useUserLocation";
import { useAuth } from "../context/AuthContext";

import { getFarmers } from "../services/farmer.service";
import { getDistanceKm } from "../utils/distance";
import * as pageCache from "../utils/pageCache";

const CACHE_KEY = "nearbyFarmers";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function useNearbyFarmers() {
  const { profile } = useAuth();
  const {
    location: gpsLocation,
    loadingLocation,
    refreshLocation,
    locationError,
  } = useUserLocation(true);

  const isValidLocation = (value) =>
    Boolean(
      value &&
        typeof value.lat === "number" &&
        !isNaN(value.lat) &&
        typeof value.lng === "number" &&
        !isNaN(value.lng),
    );

  const { userLocation, hasRealLocation } = useMemo(() => {
    if (isValidLocation(gpsLocation)) {
      return { userLocation: gpsLocation, hasRealLocation: true };
    }

    // The profile address is a legitimate fallback, but only when the user
    // actually registered one.
    if (isValidLocation(profile?.location)) {
      return { userLocation: profile.location, hasRealLocation: true };
    }

    // No usable position. Keep a stable search center so the page still
    // renders, but flag it as a placeholder: showing "You are here" at an
    // invented coordinate is misleading.
    return {
      userLocation: { lat: 13.9411, lng: 121.6243 },
      hasRealLocation: false,
    };
  }, [gpsLocation, profile]);

  const [loading, setLoading] = useState(() => !pageCache.get(CACHE_KEY));
  const [allFarmers, setAllFarmers] = useState(() => pageCache.get(CACHE_KEY) ?? []);

  const [maxDistance, setMaxDistanceState] = useState(() => {
    const stored = localStorage.getItem("agri_nearby_distance");
    return stored ? Number(stored) : 3;
  });

  const setMaxDistance = useCallback((dist) => {
    const val = Number(dist) || 3;
    setMaxDistanceState(val);
    localStorage.setItem("agri_nearby_distance", String(val));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("agri_nearby_distance");
    if (stored) {
      setMaxDistanceState(Number(stored));
    }
  }, []);

  const loadFarmers = useCallback(async () => {
    const cached = pageCache.get(CACHE_KEY);
    if (cached && Array.isArray(cached) && cached.length > 0) {
      setAllFarmers(cached);
      setLoading(false);
      return;
    }

    try {
      if (allFarmers.length === 0) {
        setLoading(true);
      }

      const all = [];
      let cursor = null;
      let hasMore = true;
      let guard = 0;
      while (hasMore && guard < 10) {
        const { farmers: page, cursor: nextCursor, hasMore: more } = await getFarmers({
          hasProducts: true,
          lat: userLocation.lat,
          lng: userLocation.lng,
          cursor,
          limit: 100,
        });
        all.push(...(Array.isArray(page) ? page : []));
        cursor = nextCursor;
        hasMore = more === true && (Array.isArray(page) ? page.length : 0) > 0;
        guard += 1;
      }

      setAllFarmers(all);
      pageCache.set(CACHE_KEY, all, CACHE_TTL);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userLocation.lat, userLocation.lng, allFarmers.length]);

  useEffect(() => {
    loadFarmers();
  }, [loadFarmers]);

  const nearbyFarmers = useMemo(() => {
    return (allFarmers || [])
      .map((farmer) => {
        const fLat = farmer.location?.lat;
        const fLng = farmer.location?.lng;

        if (
          typeof fLat !== "number" ||
          isNaN(fLat) ||
          typeof fLng !== "number" ||
          isNaN(fLng)
        ) {
          return {
            ...farmer,
            distance: typeof farmer.distance === "number" ? farmer.distance : null,
          };
        }

        const distance =
          typeof farmer.distance === "number" && !isNaN(farmer.distance)
            ? farmer.distance
            : getDistanceKm(
                userLocation.lat,
                userLocation.lng,
                fLat,
                fLng,
              );

        return {
          ...farmer,
          distance: typeof distance === "number" && !isNaN(distance) ? distance : null,
        };
      })
      .filter((farmer) => {
        return (
          typeof farmer.distance === "number" &&
          !isNaN(farmer.distance) &&
          farmer.distance <= maxDistance
        );
      })
      .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
  }, [allFarmers, userLocation, maxDistance]);

  const nearestFarmer = nearbyFarmers[0] ?? null;

  return {
    loading: loading && allFarmers.length === 0,
    loadingLocation,

    userLocation,
    hasRealLocation,

    locationError,

    farmers: nearbyFarmers,
    nearbyFarmers,

    nearestFarmer,

    maxDistance,
    setMaxDistance,

    refreshLocation,
    reloadFarmers: () => {
      pageCache.invalidate(CACHE_KEY);
      loadFarmers();
    },
  };
}
