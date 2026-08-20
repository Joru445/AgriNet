export default function EmptyNearby() {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center">
      <i className="ri-map-pin-line text-5xl text-gray-300" />

      <h3 className="mt-4 text-lg font-semibold text-gray-700">
        No farmers found
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        Try increasing your search distance.
      </p>
    </div>
  );
}
