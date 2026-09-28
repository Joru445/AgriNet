export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        resolve({
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  });
}

export async function reverseGeocode(lat, lng) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

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

export async function searchLocation(query) {
  if (!query?.trim()) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

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

