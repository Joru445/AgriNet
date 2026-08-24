export default function ProfileForm({ form, editing, onChange }) {
  return (
    <div className="px-4 lg:px-8 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Full Name
          </label>

          <input
            name="fullname"
            value={form.fullname}
            onChange={onChange}
            disabled={!editing}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Username
          </label>

          <input
            name="username"
            value={form.username}
            onChange={onChange}
            disabled={!editing}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>

          <input
            value={form.email}
            disabled
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-gray-100"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contact Number
          </label>

          <input
            name="phone"
            value={form.phone || ""}
            onChange={onChange}
            disabled={!editing}
            placeholder="09XXXXXXXXX"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="mt-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Bio
        </label>

        <textarea
          rows={5}
          name="bio"
          value={form.bio}
          onChange={onChange}
          disabled={!editing}
          placeholder="Tell people a little about yourself..."
          className="w-full px-4 py-3 rounded-xl border border-gray-300 disabled:bg-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
        />
      </div>
    </div>
  );
}
