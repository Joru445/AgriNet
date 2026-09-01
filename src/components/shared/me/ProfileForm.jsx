export default function ProfileForm({ form, editing, onChange }) {
  return (
    <div className="border-t border-[var(--agri-border-subtle)] px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-sm font-bold text-[var(--agri-text)] mb-4">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="profile-fullname"
            className="block text-sm font-medium text-[var(--agri-text-secondary)] mb-1.5"
          >
            Full Name
          </label>

          <input
            id="profile-fullname"
            name="fullname"
            value={form.fullname}
            onChange={onChange}
            disabled={!editing}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--agri-input-border)] bg-[var(--agri-input-bg)] text-sm text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-colors"
          />
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="profile-username"
            className="block text-sm font-medium text-[var(--agri-text-secondary)] mb-1.5"
          >
            Username
          </label>

          <input
            id="profile-username"
            name="username"
            value={form.username}
            onChange={onChange}
            disabled={!editing}
            required
            pattern="[a-z0-9._]+"
            minLength={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--agri-input-border)] bg-[var(--agri-input-bg)] text-sm text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="profile-email"
            className="block text-sm font-medium text-[var(--agri-text-secondary)] mb-1.5"
          >
            Email Address
          </label>

          <input
            id="profile-email"
            value={form.email}
            disabled
            readOnly
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--agri-border)] bg-[var(--agri-hover)] text-sm text-[var(--agri-text-muted)] cursor-not-allowed"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="profile-phone"
            className="block text-sm font-medium text-[var(--agri-text-secondary)] mb-1.5"
          >
            Contact Number
          </label>

          <input
            id="profile-phone"
            name="phone"
            value={form.phone || ""}
            onChange={onChange}
            disabled={!editing}
            placeholder="09XXXXXXXXX"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--agri-input-border)] bg-[var(--agri-input-bg)] text-sm text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Bio */}
      <div className="mt-5">
        <label
          htmlFor="profile-bio"
          className="block text-sm font-medium text-[var(--agri-text-secondary)] mb-1.5"
        >
          Bio
        </label>

        <textarea
          id="profile-bio"
          rows={4}
          name="bio"
          value={form.bio}
          onChange={onChange}
          disabled={!editing}
          placeholder="Tell people a little about yourself..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--agri-input-border)] bg-[var(--agri-input-bg)] text-sm text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-colors"
        />
      </div>
    </div>
  );
}
