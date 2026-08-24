import { useCallback, useEffect, useState } from "react";

import { getCurrentPosition, reverseGeocode } from "../utils/location";

export default function useUserLocation(autoLoad = true) {
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(autoLoad);
  const [locationError, setLocationError] = useState(null);

  const refreshLocation = useCallback(async () => {
    try {
      setLoadingLocation(true);
      setLocationError(null);

      const position = await getCurrentPosition();

      const address = await reverseGeocode(position.lat, position.lng);

      const location = {
        ...position,
        address,
      };

      setLocation(location);

      return location;
    } catch (error) {
      console.warn("Location not available:", error.message || error);

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
