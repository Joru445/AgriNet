import { Link } from "react-router-dom";

import logo from "../../assets/favicon.ico";
import landscapeBg from "../../assets/img/landscape.jpg";

import { useLanguage } from "../../context/LanguageContext";

import AccountStep from "./AccountStep";
import PasswordStep from "./PasswordStep";
import ProfileStep from "./ProfileStep";
import MethodStep from "./MethodStep";
import { requiresPasswordStep } from "../../utils/registerValidation";

export default function RegisterForm({
  registrationMethod = null,
  selectRegistrationMethod,
  isEmailReadOnly = false,
  step,
  form,
  errors = {},
  touched = {},
  loading = false,
  isCheckingEmail = false,
  updateField,
  setFieldTouched,
  updateLocation,
  handleStep1Continue,
  handleStep2Continue,
  previousStep,
  submit,
}) {
  const { t } = useLanguage();

  return (
    <div
      className="flex-1 w-full min-w-0 relative h-full min-h-0 overflow-y-auto scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ backgroundColor: "var(--agri-bg-surface)" }}
    >
      {/* Mobile-only agricultural landscape background */}
      <div className="fixed inset-0 lg:hidden pointer-events-none overflow-hidden">
        <img
          src={landscapeBg}
          alt="Agricultural background"
          className="w-full h-full object-cover object-center scale-105 blur-[1.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e1a]/85 via-[#1B4332]/75 to-[#2D6A4F]/65" />
      </div>

      <div className="relative z-10 w-full min-h-full flex flex-col items-center justify-start lg:justify-center p-3 sm:p-6 md:p-12 py-6 sm:py-8 pb-24 sm:pb-12">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl p-5 sm:p-7 md:p-9 lg:bg-white lg:border-transparent lg:shadow-xl lg:backdrop-blur-none">
          {/* Mobile Logo */}
          <div className="border-b-2 border-[#1B4332]/20 pb-3 mb-3.5 sm:pb-4 sm:mb-5 lg:hidden">
            <Link
              className="flex items-center gap-2.5 no-underline hover:no-underline"
              to="/"
            >
              <img
                src={logo}
                alt="AgriNet Logo"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
              />

              <span className="font-bold text-[#1B4332] text-lg sm:text-xl">
                AgriNet <span className="font-light">Lucena</span>
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332]">
              {t("auth.register.title")}
            </h1>

            <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
              {registrationMethod
                ? t("auth.register.subtitle")
                : t("auth.register.chooseMethod")}
            </p>
          </div>

          {/* Step Indicator (multi-step email registration) */}
          {registrationMethod === "email" && (
            <div className="flex items-center mb-4 sm:mb-6">
              {[1, 2, 3].map((number) => (
                <div
                  key={number}
                  className="flex items-center flex-1 last:flex-none"
                >
                  <div
                    className={`
                      h-6 w-6 sm:h-7 sm:w-7 shrink-0 rounded-full
                      flex items-center justify-center
                      text-xs sm:text-sm font-semibold
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
          )}

          {/* Method Selection Screen */}
          {!registrationMethod && (
            <MethodStep onSelectMethod={selectRegistrationMethod} />
          )}

          {/* Registration Steps */}
          {registrationMethod && step === 1 && (
            <AccountStep
              form={form}
              errors={errors}
              touched={touched}
              isCheckingEmail={isCheckingEmail}
              isEmailReadOnly={isEmailReadOnly}
              updateField={updateField}
              setFieldTouched={setFieldTouched}
              onBack={previousStep}
              onContinue={handleStep1Continue}
            />
          )}

          {requiresPasswordStep(registrationMethod) && step === 2 && (
            <PasswordStep
              form={form}
              errors={errors}
              touched={touched}
              updateField={updateField}
              setFieldTouched={setFieldTouched}
              onBack={previousStep}
              onContinue={handleStep2Continue}
            />
          )}

          {registrationMethod && step === 3 && (
            <ProfileStep
              form={form}
              errors={errors}
              touched={touched}
              loading={loading}
              updateField={updateField}
              setFieldTouched={setFieldTouched}
              updateLocation={updateLocation}
              onBack={previousStep}
              onSubmit={submit}
            />
          )}

          {/* Login */}
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
            {t("auth.register.hasAccount")}{" "}
            <Link
              to="/login"
              className="text-[#2D6A4F] font-semibold hover:underline"
            >
              {t("auth.register.signIn")}
            </Link>
          </p>

          {/* Back Home */}
          <p className="text-center text-xs text-gray-500 mt-2 sm:mt-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-1 hover:text-[#2D6A4F]"
            >
              <i className="ri-arrow-left-line" />
              {t("auth.backHome")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
