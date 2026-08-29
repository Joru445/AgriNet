import PasswordInput from "./PasswordInput";
import { getPasswordChecks } from "../../utils/registerValidation";

export default function PasswordStep({
  form,
  errors = {},
  touched = {},
  updateField,
  setFieldTouched,
  onBack,
  onContinue,
}) {
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
        label: "None",
        color: "bg-gray-200",
        width: "w-0",
      };
    }
    if (passed <= 2)
      return {
        label: "Weak",
        color: "bg-red-500",
        width: "w-1/4",
      };

    if (passed <= 4)
      return {
        label: "Medium",
        color: "bg-yellow-500",
        width: "w-2/3",
      };

    return {
      label: "Strong",
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
          label="Password"
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
          label="Confirm Password"
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
          <span className="text-gray-600">Password Strength</span>

          <span
            className={
              level.label === "Strong"
                ? "text-[#2D6A4F]"
                : level.label === "Medium"
                  ? "text-yellow-600"
                  : level.label === "Weak"
                    ? "text-red-600"
                    : "text-gray-400"
            }
          >
            {level.label}
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
        <Rule valid={checks.length} text="At least 8 characters" />
        <Rule valid={checks.uppercase} text="One uppercase letter (A-Z)" />
        <Rule valid={checks.lowercase} text="One lowercase letter (a-z)" />
        <Rule valid={checks.number} text="One number (0-9)" />
        <Rule valid={checks.special} text="One special character (!@#$%...)" />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border-2 border-gray-300 hover:border-gray-400 py-3 text-gray-700 font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
        >
          Back
        </button>

        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-sm"
        >
          Continue
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
