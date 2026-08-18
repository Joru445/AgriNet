import { Link } from "react-router-dom";

import logo from "../../assets/favicon.ico";

import AccountStep from "./AccountStep";
import PasswordStep from "./PasswordStep";
import ProfileStep from "./ProfileStep";

export default function RegisterForm({
  step,
  form,
  loading,
  updateField,
  updateLocation,
  nextStep,
  previousStep,
  submit,
}) {
  return (
    <div className="flex-1 h-screen min-h-0 overflow-y-auto bg-white scrollbar-none">
      <div className="min-h-full flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <img
              src={logo}
              alt="AgriNet Logo"
              className="h-8 w-8 object-contain"
            />

            <span className="font-bold text-[#1B4332]">AgriNet</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1B4332]">
              Create Your Account
            </h1>

            <p className="text-gray-500 text-sm mt-1">Join AgriNet today.</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center mb-8">
            {[1, 2, 3].map((number) => (
              <div
                key={number}
                className="flex items-center flex-1 last:flex-none"
              >
                <div
                  className={`
                    h-7 w-7 shrink-0 rounded-full
                    flex items-center justify-center
                    text-sm font-semibold
                    transition-colors
                    ${
                      step >= number
                        ? "bg-[#2D6A4F] text-white"
                        : "bg-gray-100 text-gray-500"
                    }
                  `}
                >
                  {number}
                </div>

                {number < 3 && (
                  <div
                    className={`
                      flex-1 h-1 mx-2 rounded-full
                      transition-colors
                      ${step > number ? "bg-[#2D6A4F]" : "bg-gray-200"}
                    `}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Registration Steps */}
          {step === 1 && (
            <AccountStep
              form={form}
              updateField={updateField}
              onContinue={nextStep}
            />
          )}

          {step === 2 && (
            <PasswordStep
              form={form}
              errors={{}}
              onChange={(e) => updateField(e.target.name, e.target.value)}
              onBack={previousStep}
              onContinue={nextStep}
            />
          )}

          {step === 3 && (
            <ProfileStep
              form={form}
              loading={loading}
              updateField={updateField}
              updateLocation={updateLocation}
              onBack={previousStep}
              onSubmit={submit}
            />
          )}

          {/* Login */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#2D6A4F] font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>

          {/* Back Home */}
          <p className="text-center text-xs text-gray-400 mt-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1 hover:text-[#2D6A4F]"
            >
              <i className="ri-arrow-left-line" />
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
