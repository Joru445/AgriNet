import RoleSelector from "./RoleSelector";

export default function AccountStep({
  form,
  errors = {},
  touched = {},
  isCheckingEmail = false,
  updateField,
  setFieldTouched,
  onContinue,
}) {
  const fullnameError = touched.fullname ? errors.fullname : null;
  const usernameError = touched.username ? errors.username : null;
  const emailError = touched.email ? errors.email : null;

  return (
    <div className="space-y-4 w-full">
      <RoleSelector
        value={form.role}
        onChange={(role) => updateField("role", role)}
      />

      {/* Full Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Full Name <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            value={form.fullname}
            placeholder="Juan dela Cruz"
            onChange={(e) => updateField("fullname", e.target.value)}
            onBlur={() => setFieldTouched?.("fullname")}
            className={`w-full pl-8 pr-10 py-2.5 border-2 rounded-lg text-sm focus:outline-none transition-colors ${
              fullnameError
                ? "border-red-500 focus:border-red-500 bg-red-50/20"
                : "border-gray-200 focus:border-[#2D6A4F]"
            }`}
          />
        </div>

        {fullnameError && (
          <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
            <i className="ri-error-warning-line text-xs" />
            <span>{fullnameError}</span>
          </p>
        )}
      </div>

      {/* Username */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Username <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <i className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
            @
          </i>
          <input
            value={form.username}
            placeholder="juan123"
            onChange={(e) => updateField("username", e.target.value)}
            onBlur={() => setFieldTouched?.("username")}
            className={`w-full pl-8 pr-10 py-2.5 border-2 rounded-lg text-sm focus:outline-none transition-colors ${
              usernameError
                ? "border-red-500 focus:border-red-500 bg-red-50/20"
                : "border-gray-200 focus:border-[#2D6A4F]"
            }`}
          />
        </div>

        {usernameError && (
          <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
            <i className="ri-error-warning-line text-xs" />
            <span>{usernameError}</span>
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="email"
            value={form.email}
            placeholder="juan@gmail.com"
            onChange={(e) => updateField("email", e.target.value)}
            onBlur={() => setFieldTouched?.("email")}
            className={`w-full pl-8 pr-10 py-2.5 border-2 rounded-lg text-sm focus:outline-none transition-colors ${
              emailError
                ? "border-red-500 focus:border-red-500 bg-red-50/20"
                : "border-gray-200 focus:border-[#2D6A4F]"
            }`}
          />
        </div>

        {emailError && (
          <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
            <i className="ri-error-warning-line text-xs" />
            <span>{emailError}</span>
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={isCheckingEmail}
        onClick={onContinue}
        className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-75 cursor-pointer shadow-sm"
      >
        {isCheckingEmail ? (
          <>
            <i className="ri-loader-4-line animate-spin text-base" />
            <span>Checking email...</span>
          </>
        ) : (
          <span>Continue</span>
        )}
      </button>
    </div>
  );
}
