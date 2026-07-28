let userLocation = null;

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        userLocation = {
          lat: coords.latitude,
          lng: coords.longitude,
        };

        resolve(userLocation);
      },
      reject,
      {
        enableHighAccuracy: true,
      },
    );
  });
}

export function watchUserLocation(success, error) {
  return navigator.geolocation.watchPosition(
    (pos) => {
      success({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      });
    },
    error,
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
    },
  );
}
