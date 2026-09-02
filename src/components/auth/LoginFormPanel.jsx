import { Link } from "react-router-dom";

import logo from "../../assets/favicon.ico";
import landscapeBg from "../../assets/img/landscape.jpg";

import { useLanguage } from "../../context/LanguageContext";

import FormInput from "./FormInput";
import PasswordInput from "./PasswordInput";
import ErrorAlert from "./ErrorAlert";

export default function LoginFormPanel({
  form,
  errors,
  loading,
  onChange,
  onSubmit,
}) {
  const { t } = useLanguage();

  return (
    <div
      className="flex-1 relative flex items-center justify-center p-3 sm:p-6 md:p-12 min-h-screen overflow-y-auto"
    >
      {/* Mobile-only agricultural landscape background */}
      <div className="absolute inset-0 lg:hidden pointer-events-none overflow-hidden">
        <img
          src={landscapeBg}
          alt="Agricultural background"
          className="w-full h-full object-cover object-center scale-105 blur-[1.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e1a]/85 via-[#1B4332]/75 to-[#2D6A4F]/65" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl p-5 sm:p-8 md:p-10 lg:bg-white lg:border-transparent lg:shadow-xl lg:backdrop-blur-none my-auto">
        <div className="border-b-2 border-[#1B4332]/20 pb-3 mb-4 sm:pb-4 sm:mb-6 lg:hidden">
          <Link className="flex items-center gap-2 no-underline hover:no-underline" to="/">
            <img
              src={logo}
              alt="AgriNet Logo"
              className="h-7 w-7 sm:h-8 sm:w-8 object-contain"
            />
            <span className="font-bold text-[#1B4332] text-base sm:text-lg">
              AgriNet <span className="font-light">Lucena</span>
            </span>
          </Link>
        </div>

        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332]">{t("auth.login.welcomeBack")}</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
            {t("auth.login.subtitle")}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <ErrorAlert message={errors.general} />

            <FormInput
              label={t("auth.emailLabel")}
              name="email"
              type="email"
              icon="ri-mail-line"
              value={form.email}
              onChange={onChange}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <PasswordInput
            label={t("auth.passwordLabel")}
            name="password"
            value={form.password}
            onChange={onChange}
            error={errors.password}
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-[#2D6A4F] hover:underline"
            >
              {t("auth.login.forgotPassword")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 cursor-pointer"
          >
            <i className="ri-login-box-line"></i>
            {loading ? t("auth.login.signingIn") : t("auth.login.signIn")}
          </button>
        </form>

        <p className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
          {t("auth.login.noAccount")}{" "}
          <Link
            to="/register"
            data-route
            className="text-[#2D6A4F] font-semibold hover:underline cursor-pointer"
          >
            {t("auth.login.registerHere")}
          </Link>
        </p>

        <p className="text-center text-xs text-gray-500 mt-2 sm:mt-4">
          <Link
            to="/"
            className="hover:text-[#2D6A4F] flex items-center justify-center gap-1"
          >
            <i className="ri-arrow-left-line"></i>
            {t("auth.backHome")}
          </Link>
        </p>
      </div>
    </div>
  );
}
