import RoleSelector from "./RoleSelector";
import {
  authFieldErrorClass,
  authInputBaseClass,
  authInputErrorClass,
  authInputIconClass,
  authInputNormalClass,
  authLabelClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
} from "./authStyles";
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
        <label className={authLabelClass}>
          {t("auth.register.fullName")} <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <i className={`ri-user-line ${authInputIconClass}`} />
          <input
            value={form.fullname}
            placeholder="Juan dela Cruz"
            onChange={(e) => updateField("fullname", e.target.value)}
            onBlur={() => setFieldTouched?.("fullname")}
            className={`${authInputBaseClass} pl-10 pr-3 ${
              fullnameError
                ? authInputErrorClass
                : authInputNormalClass
            }`}
          />
        </div>

        {fullnameError && (
          <p className={authFieldErrorClass}>
            <i className="ri-error-warning-line text-xs" />
            <span>{fullnameError}</span>
          </p>
        )}
      </div>

      {/* Username */}
      <div>
        <label className={authLabelClass}>
          {t("auth.register.username")} <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <i className={`${authInputIconClass} font-semibold`}>
            @
          </i>
          <input
            value={form.username}
            placeholder="juan123"
            onChange={(e) => updateField("username", e.target.value)}
            onBlur={() => setFieldTouched?.("username")}
            className={`${authInputBaseClass} pl-10 pr-3 ${
              usernameError
                ? authInputErrorClass
                : authInputNormalClass
            }`}
          />
        </div>

        {usernameError && (
          <p className={authFieldErrorClass}>
            <i className="ri-error-warning-line text-xs" />
            <span>{usernameError}</span>
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={authLabelClass}>
            {t("auth.emailLabel")} <span className="text-red-500">*</span>
          </label>
          {isEmailReadOnly && (
            <span className="text-[10px] font-semibold text-[#2D6A4F] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Verified
            </span>
          )}
        </div>

        <div className="relative">
          <i className={`ri-mail-line ${authInputIconClass}`} />
          <input
            type="email"
            value={form.email}
            readOnly={isEmailReadOnly}
            disabled={isEmailReadOnly}
            placeholder="juan@gmail.com"
            onChange={(e) => updateField("email", e.target.value)}
            onBlur={() => setFieldTouched?.("email")}
            className={
              isEmailReadOnly
                ? `w-full h-11 rounded-lg border-2 bg-gray-100/80 text-gray-600 border-gray-200 pl-10 pr-3 text-sm cursor-not-allowed select-none transition-colors`
                : `${authInputBaseClass} pl-10 pr-3 ${
                    emailError
                      ? authInputErrorClass
                      : authInputNormalClass
                  }`
            }
          />
        </div>

        {emailError && (
          <p className={authFieldErrorClass}>
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
            className={`flex-1 ${authSecondaryButtonClass}`}
          >
            {t("common.back")}
          </button>
        )}

        <button
          type="button"
          disabled={isCheckingEmail}
          onClick={onContinue}
          className={`${onBack ? "flex-1" : "w-full"} ${authPrimaryButtonClass}`}
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
