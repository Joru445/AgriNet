import LocationMap from "./LocationMap";

import useUserLocation from "../../hooks/useUserLocation";

export default function LocationPicker({ editing, value, onProfile = false, onChange }) {
  const { loadingLocation, refreshLocation } = useUserLocation(false);

  async function handleUseCurrentLocation() {
    const location = await refreshLocation();

    if (!location) return;

    onChange(location);
  }

  return (
    <div className="space-y-5">
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        Farm Location
      </label>
      <div className="flex gap-3 relative">
        {editing && (
          <>
            <i className="ri-map-pin-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              value={value?.address ?? ""}
              readOnly
              className="w-full pl-8 pr-10 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={loadingLocation}
              aria-label="Press to get location"
              className="px-4 rounded-xl bg-[#2D6A4F] text-white hover:bg-[#24563f] disabled:opacity-50"
            >
              {loadingLocation ? (
                <i className="ri-loader-4-line animate-spin" />
              ) : (
                <i className="ri-crosshair-2-line" />
              )}
            </button>
          </>
        )}
      </div>

      <LocationMap editing={editing} value={value} onProfile={onProfile} onChange={onChange} />

      {value?.address && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
          <div className="mb-1 text-xs font-medium text-gray-500">
            Selected Address
          </div>

          <div className="text-sm text-[#2D6A4F]">
            <i className="ri-map-pin-line mr-1" />
            {value.address}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-500">Latitude</label>

          <input
            readOnly
            value={value?.lat?.toFixed(6) ?? ""}
            className="w-full pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Longitude</label>

          <input
            readOnly
            value={value?.lng?.toFixed(6) ?? ""}
            className="w-full pl-4 pr-10 py-2.5 border-2 border-gray-200 rounded-lg text-sm"
          />
        </div>
      </div>
    </div>
  );
}
