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

      const { farmers: data } = await getFarmers({
        hasProducts: true,
        lat: validUserLocation.lat,
        lng: validUserLocation.lng,
      });

      const list = Array.isArray(data) ? data : [];
      setAllFarmers(list);
      pageCache.set(CACHE_KEY, list, CACHE_TTL);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [validUserLocation.lat, validUserLocation.lng, allFarmers.length]);

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
                validUserLocation.lat,
                validUserLocation.lng,
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
  }, [allFarmers, validUserLocation, maxDistance]);

  const nearestFarmer = nearbyFarmers[0] ?? null;

  return {
    loading: loading && allFarmers.length === 0,
    loadingLocation,

    userLocation: validUserLocation,

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
