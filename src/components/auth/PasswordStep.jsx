import { showToast } from "../../utils/toast";

import PasswordInput from "./PasswordInput";

export default function PasswordStep({
  form,
  errors,
  onChange,
  onBack,
  onContinue,
}) {
  const password = form.password;

  const confirmPasswordError =
    form.confirmPassword && form.password !== form.confirmPassword
      ? "Passwords do not match."
      : "";

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passed = Object.values(checks).filter(Boolean).length;

  function strength() {
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
      color: "bg-green-600",
      width: "w-full",
    };
  }

  function handleContinue() {
    if (!password) {
      showToast.error("Please enter a password.");
      return;
    }

    if (password.length < 8) {
      showToast.error("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      showToast.error("Password must contain an uppercase letter.");
      return;
    }

    if (!/\d/.test(password)) {
      showToast.error("Password must contain a number.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      showToast.error("Password must contain a special character.");
      return;
    }

    if (password !== form.confirmPassword) {
      showToast.error("Passwords do not match.");
      return;
    }

    onContinue();
  }

  const level = strength();

  return (
    <div className="space-y-6">
      <PasswordInput
        label="Password"
        name="password"
        value={form.password}
        onChange={onChange}
        error={errors.password}
      />

      <PasswordInput
        label="Confirm Password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={onChange}
        error={confirmPasswordError || errors.confirmPassword}
      />

      <div>
        <div className="flex justify-between mb-2 text-sm">
          <span>Password Strength</span>

          <span
            className={
              level.label === "Strong"
                ? "text-green-600"
                : level.label === "Medium"
                  ? "text-yellow-600"
                  : "text-red-600"
            }
          >
            {level.label}
          </span>
        </div>

        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full transition-all ${level.color} ${level.width}`}
          />
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <Rule valid={checks.length} text="At least 8 characters" />

        <Rule valid={checks.uppercase} text="One uppercase letter" />

        <Rule valid={checks.lowercase} text="One lowercase letter" />

        <Rule valid={checks.number} text="One number" />

        <Rule valid={checks.special} text="One special character" />
      </div>

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
          onClick={handleContinue}
          className="flex-1 py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
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
      className={`flex items-center gap-2 ${
        valid ? "text-green-600" : "text-gray-500"
      }`}
    >
      <i
        className={
          valid ? "ri-checkbox-circle-fill" : "ri-checkbox-blank-circle-line"
        }
      />

      <span>{text}</span>
    </div>
  );
}
