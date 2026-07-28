import { useState } from "react";

import LocationMap from "./LocationMap";

import useUserLocation from "../../hooks/useUserLocation";

export default function LocationPicker({ editing, value, onChange }) {
  const [search, setSearch] = useState("");

  const { loadingLocation, refreshLocation } = useUserLocation(false);

  async function handleUseCurrentLocation() {
    const location = await refreshLocation();

    if (!location) return;

    onChange(location);
  }

  return (
    <div className="space-y-5 pt-5">
      <div className="flex gap-3">
        {editing && (
          <>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={!editing}
              placeholder="Search address..."
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2 disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={loadingLocation}
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

      <LocationMap editing={editing} value={value} onChange={onChange} />

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
            className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500">Longitude</label>

          <input
            readOnly
            value={value?.lng?.toFixed(6) ?? ""}
            className="mt-1 w-full rounded-xl border bg-gray-50 px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}
