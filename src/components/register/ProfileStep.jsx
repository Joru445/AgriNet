import LocationPicker from "../location/LocationPicker";

export default function ProfileStep({
  form,
  loading,
  updateField,
  updateLocation,
  onBack,
  onSubmit,
}) {
  const phoneValid =
    !form.contactNumber || /^(09)\d{9}$/.test(form.contactNumber);

  return (
    <div className="space-y-4 w-full">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          Contact Number
        </label>

        <div className="relative">
          <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={13}
            placeholder="09XXXXXXXXX"
            value={form.contactNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d+]/g, "");
              updateField("contactNumber", value);
            }}
            className={`
              w-full pl-8 pr-10 py-2.5 border-2 rounded-lg text-sm focus:outline-none transition-colors
              ${phoneValid ? "border-gray-200 focus:border-[#2D6A4F]" : "border-red-500 focus:border-red-500"}
            `}
          />
        </div>

        {!phoneValid && (
          <p className="mt-1 text-sm text-red-500">
            Enter a valid Philippine mobile number (09XXXXXXXXX).
          </p>
        )}
      </div>

      {form.role === "farmer" && (
        <LocationPicker
          editing
          value={form.location}
          onChange={updateLocation}
        />
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border py-3 text-gray-600 font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
        >
          Back
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={onSubmit}
          className="flex-1 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2" />
              Creating...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </div>
    </div>
  );
}
