import { useEffect, useMemo, useState } from "react";

import useUserLocation from "./useUserLocation";
import { useAuth } from "../context/AuthContext";

import { getFarmers } from "../services/farmer.service";
import { getDistanceKm } from "../utils/distance";

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

  const [loading, setLoading] = useState(true);
  const [farmers, setFarmers] = useState([]);

  const [maxDistance, setMaxDistanceState] = useState(() => {
    const stored = localStorage.getItem("agri_consumer_distance");
    return stored ? Number(stored) : 10;
  });

  const setMaxDistance = (dist) => {
    const val = Number(dist) || 10;
    localStorage.setItem("agri_consumer_distance", String(val));
    setMaxDistanceState(val);
  };

  useEffect(() => {
    const stored = localStorage.getItem("agri_consumer_distance");
    if (stored) {
      setMaxDistanceState(Number(stored));
    }
  }, []);

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
    return farmers
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
            distance: null,
          };
        }

        if (!validUserLocation) {
          return {
            ...farmer,
            distance: null,
          };
        }

        const distance = getDistanceKm(
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
  }, [farmers, validUserLocation, maxDistance]);

  const nearestFarmer = nearbyFarmers[0] ?? null;

  return {
    loading,
    loadingLocation,

    userLocation: validUserLocation,

    farmers,
    nearbyFarmers,

    nearestFarmer,

    maxDistance,
    setMaxDistance,

    refreshLocation,
    reloadFarmers: loadFarmers,
  };
}