import StarRating from "./StarRating";

import LocationPicker from "../location/LocationPicker";

export default function FarmerSection({ form, stats, editing, onChange }) {
  return (
    <div className="border-t border-gray-200 px-4 lg:px-8 py-8">
      <h2 className="text-lg font-bold text-[#1B4332] mb-6">
        Farmer Information
      </h2>

      <LocationPicker
        editing={editing}
        value={form.location}
        onProfile={true}
        onChange={(location) =>
          onChange({
            target: {
              name: "location",
              value: location,
            },
          })
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Rating
          </label>

          <div className="h-[42px] flex items-center">
            <StarRating rating={form.rating || 0} />
          </div>
        </div>
      </div>

      {/* Farm Description */}
      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Farm Description
        </label>

        <textarea
          rows={4}
          name="description"
          value={form.description}
          onChange={onChange}
          disabled={!editing}
          placeholder="Tell customers about your farm..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 disabled:bg-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        <div className="rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-[#2D6A4F]">
            {stats.products ?? 0}
          </p>

          <p className="text-sm text-gray-500 mt-2">Products</p>
        </div>

        <div className="rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-[#2D6A4F]">
            {stats.reviews ?? 0}
          </p>

          <p className="text-sm text-gray-500 mt-2">Reviews</p>
        </div>

        <div className="rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-[#2D6A4F]">
            {stats.inquiriesCount ?? 0}
          </p>

          <p className="text-sm text-gray-500 mt-2">Inquiries</p>
        </div>

        <div className="rounded-2xl border border-gray-200 p-5 text-center">
          <p className="text-3xl font-bold text-[#2D6A4F]">
            {stats.ordersCompleted ?? 0}
          </p>

          <p className="text-sm text-gray-500 mt-2">Completed</p>
        </div>
      </div>
    </div>
  );
}
