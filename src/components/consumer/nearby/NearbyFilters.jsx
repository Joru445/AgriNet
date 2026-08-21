export default function NearbyFilters({
  distance,
  nearestFarmer,
  onDistanceChange,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4 mt-6 mb-6">
      <div className="flex items-center gap-3">
        <label className="text-sm font-semibold text-gray-600">Distance</label>

        <input
          type="range"
          min={0.5}
          max={10}
          step={0.5}
          value={distance}
          onChange={(e) => onDistanceChange(Number(e.target.value))}
          className="w-44 accent-[#2D6A4F]"
        />

        <span className="min-w-13.75 text-sm font-semibold text-[#2D6A4F]">
          {distance} km
        </span>
      </div>

      <div className="text-sm text-gray-500">
        {nearestFarmer ? (
          <>
            Nearest farmer:
            <span className="ml-1 font-semibold text-[#2D6A4F]">
              {nearestFarmer.fullname}
            </span>
            {nearestFarmer.distance != null && (
              <>
                {" • "}
                {nearestFarmer.distance.toFixed(1)} km
              </>
            )}
          </>
        ) : (
          "No nearby farmers."
        )}
      </div>
    </div>
  );
}
