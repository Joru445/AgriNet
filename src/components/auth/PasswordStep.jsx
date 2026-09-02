import PasswordInput from "./PasswordInput";
import { getPasswordChecks } from "../../utils/registerValidation";
import { useLanguage } from "../../context/LanguageContext";

export default function PasswordStep({
  form,
  errors = {},
  touched = {},
  updateField,
  setFieldTouched,
  onBack,
  onContinue,
}) {
  const { t } = useLanguage();

  const password = form.password || "";
  const checks = getPasswordChecks(password);
  const passed = Object.values(checks).filter(Boolean).length;

  const passwordError = touched.password ? errors.password : null;
  const confirmPasswordError = touched.confirmPassword
    ? errors.confirmPassword
    : null;

  function strength() {
    if (!password) {
      return {
        labelKey: "auth.register.strengthNone",
        color: "bg-gray-200",
        width: "w-0",
      };
    }
    if (passed <= 2)
      return {
        labelKey: "auth.register.strengthWeak",
        color: "bg-red-500",
        width: "w-1/4",
      };

    if (passed <= 4)
      return {
        labelKey: "auth.register.strengthMedium",
        color: "bg-yellow-500",
        width: "w-2/3",
      };

    return {
      labelKey: "auth.register.strengthStrong",
      color: "bg-[#2D6A4F]",
      width: "w-full",
    };
  }

  const level = strength();

  return (
    <div className="space-y-5">
      {/* Password Field */}
      <div>
        <PasswordInput
          label={t("auth.passwordLabel")}
          name="password"
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          onBlur={() => setFieldTouched?.("password")}
          error={passwordError}
        />
      </div>

      {/* Confirm Password Field */}
      <div>
        <PasswordInput
          label={t("auth.register.confirmPassword")}
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          onBlur={() => setFieldTouched?.("confirmPassword")}
          error={confirmPasswordError}
        />
      </div>

      {/* Strength Bar */}
      <div>
        <div className="flex justify-between mb-1.5 text-xs font-semibold">
          <span className="text-gray-600">{t("auth.register.passwordStrength")}</span>

          <span
            className={
              level.labelKey === "auth.register.strengthStrong"
                ? "text-[#2D6A4F]"
                : level.labelKey === "auth.register.strengthMedium"
                  ? "text-yellow-600"
                  : level.labelKey === "auth.register.strengthWeak"
                    ? "text-red-600"
                    : "text-gray-400"
            }
          >
            {t(level.labelKey)}
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${level.color} ${level.width}`}
          />
        </div>
      </div>

      {/* Requirement Rules Checklist */}
      <div className="space-y-1.5 text-xs">
        <Rule valid={checks.length} text={t("auth.register.ruleLength")} />
        <Rule valid={checks.uppercase} text={t("auth.register.ruleUppercase")} />
        <Rule valid={checks.lowercase} text={t("auth.register.ruleLowercase")} />
        <Rule valid={checks.number} text={t("auth.register.ruleNumber")} />
        <Rule valid={checks.special} text={t("auth.register.ruleSpecial")} />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border-2 border-gray-300 hover:border-gray-400 py-3 text-gray-700 font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
        >
          {t("common.back")}
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-sm"
        >
          {t("auth.continue")}
        </button>
      </div>
    </div>
  );
}

function Rule({ valid, text }) {
  return (
    <div
      className={`flex items-center gap-2 transition-colors ${
        valid ? "text-emerald-700 font-medium" : "text-gray-400"
      }`}
    >
      <i
        className={`text-sm ${
          valid ? "ri-checkbox-circle-fill text-emerald-600" : "ri-checkbox-blank-circle-line text-gray-300"
        }`}
      />
      <span>{text}</span>
    </div>
  );
}
