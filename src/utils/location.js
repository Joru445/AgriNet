export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    const highAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: options.timeout ?? 8000,
      maximumAge: options.maximumAge ?? 0,
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
        });
      },
      (error) => {
        // If permission was denied by the user, reject immediately
        if (error.code === 1) {
          reject(error);
          return;
        }

        // If high accuracy timed out (code 3) or position unavailable (code 2), retry with low accuracy (common on desktop/Windows)
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            resolve({
              lat: coords.latitude,
              lng: coords.longitude,
              accuracy: coords.accuracy,
            });
          },
          (fallbackError) => {
            reject(fallbackError);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 30000,
          },
        );
      },
      highAccuracyOptions,
    );
  });
}

export async function reverseGeocode(lat, lng) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
    }

    const data = await response.json();
    return data.display_name || `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
  } catch (error) {
    console.warn("Reverse geocode failed:", error);
    return `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
  }
}

export async function searchLocation(query, countryCode = "ph") {
  if (!query?.trim()) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const countryParam = countryCode ? `&countrycodes=${encodeURIComponent(countryCode)}` : "";
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2${countryParam}&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      },
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return data.map((item) => ({
      lat: Number(item.lat),
      lng: Number(item.lon),
      address: item.display_name,
    }));
  } catch (error) {
    console.warn("Location search failed:", error);
    return [];
  }
}

