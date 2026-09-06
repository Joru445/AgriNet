import RoleSelector from "./RoleSelector";
import { useLanguage } from "../../context/LanguageContext";

export default function AccountStep({
  form,
  errors = {},
  touched = {},
  isCheckingEmail = false,
  isEmailReadOnly = false,
  updateField,
  setFieldTouched,
  onBack,
  onContinue,
}) {
  const { t } = useLanguage();

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
          {t("auth.register.fullName")} <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            value={form.fullname}
            placeholder="Juan dela Cruz"
            onChange={(e) => updateField("fullname", e.target.value)}
            onBlur={() => setFieldTouched?.("fullname")}
            className={`w-full pl-8 pr-10 py-2.5 border-2 rounded-lg text-sm focus:outline-none transition-colors text-gray-950 ${
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
          {t("auth.register.username")} <span className="text-red-500">*</span>
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
            className={`w-full pl-8 pr-10 py-2.5 border-2 rounded-lg text-sm focus:outline-none transition-colors text-gray-950 ${
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
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-gray-700">
            {t("auth.emailLabel")} <span className="text-red-500">*</span>
          </label>
          {isEmailReadOnly && (
            <span className="text-[10px] font-semibold text-[#2D6A4F] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Verified
            </span>
          )}
        </div>

        <div className="relative">
          <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="email"
            value={form.email}
            readOnly={isEmailReadOnly}
            disabled={isEmailReadOnly}
            placeholder="juan@gmail.com"
            onChange={(e) => updateField("email", e.target.value)}
            onBlur={() => setFieldTouched?.("email")}
            className={`w-full pl-8 pr-10 py-2.5 border-2 rounded-lg text-sm focus:outline-none transition-colors ${
              isEmailReadOnly
                ? "bg-gray-100/80 text-gray-600 border-gray-200 cursor-not-allowed select-none"
                : emailError
                  ? "border-red-500 focus:border-red-500 bg-red-50/20 text-gray-950"
                  : "border-gray-200 focus:border-[#2D6A4F] text-gray-950"
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

      <div className="flex gap-3 pt-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border-2 border-gray-300 hover:border-gray-400 py-3 text-gray-700 font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            {t("common.back")}
          </button>
        )}

        <button
          type="button"
          disabled={isCheckingEmail}
          onClick={onContinue}
          className={`${
            onBack ? "flex-1" : "w-full"
          } py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-75 cursor-pointer shadow-sm`}
        >
          {isCheckingEmail ? (
            <>
              <i className="ri-loader-4-line animate-spin text-base" />
              <span>{t("auth.register.checkingEmail")}</span>
            </>
          ) : (
            <span>{t("auth.continue")}</span>
          )}
        </button>
      </div>
    </div>
  );
}
