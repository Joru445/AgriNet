import { useLanguage } from "../../../context/LanguageContext";

function InfoRow({ icon, label, value, empty }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--agri-hover)] text-[#2D6A4F] dark:text-[var(--agri-brand)]">
        <i className={`${icon} text-base`} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--agri-text-muted)]">
          {label}
        </p>

        <p className="mt-0.5 truncate text-sm font-medium text-[var(--agri-text)]">
          {value || empty}
        </p>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-[var(--agri-input-border)] bg-[var(--agri-input-bg)] text-sm text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-colors";

const labelClass =
  "block text-sm font-medium text-[var(--agri-text-secondary)] mb-1.5";

export default function ProfileForm({ form, editing, onChange }) {
  const { t } = useLanguage();

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--agri-border-subtle)] bg-[var(--agri-card)] shadow-sm">
      <div className="border-b border-[var(--agri-border-subtle)] px-5 py-4 sm:px-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-[var(--agri-text)]">
          <i className="ri-user-settings-line text-lg text-[#2D6A4F] dark:text-[var(--agri-brand)]" />
          {t("profile.personalInfo")}
        </h2>
      </div>

      {editing ? (
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Full Name */}
            <div>
              <label htmlFor="profile-fullname" className={labelClass}>
                {t("profile.formLabels.fullName")}
              </label>
              <input
                id="profile-fullname"
                name="fullname"
                value={form.fullname}
                onChange={onChange}
                required
                className={inputClass}
              />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="profile-username" className={labelClass}>
                {t("profile.formLabels.username")}
              </label>
              <input
                id="profile-username"
                name="username"
                value={form.username}
                onChange={onChange}
                required
                pattern="[a-z0-9._]+"
                minLength={3}
                className={inputClass}
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="profile-email" className={labelClass}>
                {t("profile.formLabels.email")}
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
              <label htmlFor="profile-phone" className={labelClass}>
                {t("profile.formLabels.contactNumber")}
              </label>
              <input
                id="profile-phone"
                name="phone"
                value={form.phone || ""}
                onChange={onChange}
                placeholder="09XXXXXXXXX"
                className={inputClass}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-5">
            <label htmlFor="profile-bio" className={labelClass}>
              {t("profile.formLabels.bio")}
            </label>
            <textarea
              id="profile-bio"
              rows={4}
              name="bio"
              value={form.bio}
              onChange={onChange}
              placeholder={t("profile.formLabels.bioPlaceholder")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--agri-input-border)] bg-[var(--agri-input-bg)] text-sm text-[var(--agri-text)] placeholder-[var(--agri-text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] focus:border-transparent transition-colors"
            />
          </div>
        </div>
      ) : (
        <div className="divide-y divide-[var(--agri-border-subtle)]">
          <InfoRow
            icon="ri-user-line"
            label={t("profile.formLabels.fullName")}
            value={form.fullname}
            empty={t("profile.unnamedUser")}
          />
          <InfoRow
            icon="ri-at-line"
            label={t("profile.formLabels.username")}
            value={`@${form.username || "user"}`}
            empty=""
          />
          <InfoRow
            icon="ri-mail-line"
            label={t("profile.formLabels.email")}
            value={form.email}
          />
          <InfoRow
            icon="ri-phone-line"
            label={t("profile.formLabels.contactNumber")}
            value={form.phone}
            empty="—"
          />
          <InfoRow
            icon="ri-quote-text-line"
            label={t("profile.formLabels.bio")}
            value={form.bio}
            empty="—"
          />
        </div>
      )}
    </div>
  );
}