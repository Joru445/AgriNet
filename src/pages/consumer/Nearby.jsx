import { useLanguage } from "../../context/LanguageContext";

import useNearbyFarmers from "../../hooks/useNearbyFarmers";

import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import NearbyHeader from "../../components/consumer/nearby/NearbyHeader";
import NearbyMap from "../../components/consumer/nearby/NearbyMap";
import NearbyFilters from "../../components/consumer/nearby/NearbyFilters";
import NearbyFarmerGrid from "../../components/consumer/nearby/NearbyGrid";

export default function Nearby() {
  const {
    loading,
    userLocation,
    hasRealLocation,
    locationError,
    maxDistance,
    farmers,
    nearestFarmer,

    setMaxDistance,
    refreshLocation,
  } = useNearbyFarmers();

  const { t } = useLanguage();

  return (
    <main className="pb-16 md:pb-4">
      <NearbyHeader />

      {!hasRealLocation && (
        <div className="mx-3 mt-3 sm:mx-6 lg:mx-8">
          <Alert
            variant="warning"
            message={
              locationError
                ? `${t("nearby.locationUnavailable")} (${locationError.message ||
                    locationError.code ||
                    "unknown error"})`
                : t("nearby.locationUnavailable")
            }
          >
            <p className="mt-1 text-xs opacity-90">
              {t("nearby.locationUnavailableHint")}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => refreshLocation()}
            >
              <i className="ri-refresh-line mr-1.5" />
              {t("nearby.retryLocation")}
            </Button>
          </Alert>
        </div>
      )}

      <NearbyMap
        farmers={farmers}
        maxDistance={maxDistance}
        userLocation={userLocation}
        showUserMarker={hasRealLocation}
      />

      <NearbyFilters
        distance={maxDistance}
        nearestFarmer={nearestFarmer}
        onDistanceChange={setMaxDistance}
      />

      <NearbyFarmerGrid loading={loading} farmers={farmers} />
    </main>
  );
}
