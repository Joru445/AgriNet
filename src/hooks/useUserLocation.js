import { useCallback, useEffect, useState } from "react";

import { getCurrentPosition } from "../utils/location";

export default function useUserLocation(autoLoad = true) {
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(autoLoad);
  const [locationError, setLocationError] = useState(null);

  const refreshLocation = useCallback(async () => {
    try {
      setLoadingLocation(true);
      setLocationError(null);

      const position = await getCurrentPosition();

      setLocation(position);

      return position;
    } catch (error) {
      console.error("Location error:", error);

      setLocationError(error);

      return null;
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  useEffect(() => {
    if (!autoLoad) return;

    refreshLocation();
  }, [autoLoad, refreshLocation]);

  return {
    location,
    loadingLocation,
    locationError,
    refreshLocation,
    setLocation,
  };
}
