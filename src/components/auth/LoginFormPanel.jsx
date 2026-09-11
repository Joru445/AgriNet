import { Link } from "react-router-dom";

import logo from "../../assets/favicon.ico";
import landscapeBg from "../../assets/img/landscape.jpg";

import { useLanguage } from "../../context/LanguageContext";

import Avatar from "../common/Avatar";
import FormInput from "./FormInput";
import PasswordInput from "./PasswordInput";
import ErrorAlert from "./ErrorAlert";
import SavedAccountSelector from "./SavedAccountSelector";
import {
  authPrimaryButtonClass,
  authSocialButtonClass,
} from "./authStyles";

function LoginShell({ children, showMobileLogo = true, footer }) {
  return (
    <div className="flex-1 relative flex items-center justify-center p-3 sm:p-6 md:p-12 min-h-screen overflow-y-auto">
      <div className="absolute inset-0 lg:hidden pointer-events-none overflow-hidden">
        <img
          src={landscapeBg}
          alt="Agricultural background"
          className="w-full h-full object-cover object-center scale-105 blur-[1.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e1a]/85 via-[#1B4332]/75 to-[#2D6A4F]/65" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl p-5 sm:p-7 md:p-9 lg:bg-white lg:border-transparent lg:shadow-xl lg:backdrop-blur-none my-auto">
        {showMobileLogo && (
          <div className="border-b-2 border-[#1B4332]/20 pb-3 mb-4 sm:pb-4 sm:mb-6 lg:hidden">
            <Link
              className="flex items-center gap-2 no-underline hover:no-underline"
              to="/landing"
            >
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
        )}
        {children}
        {footer}
      </div>
    </div>
  );
}

function BackHomeLink({ label }) {
  return (
    <p className="text-center text-xs text-gray-500 mt-5 sm:mt-6">
      <Link
        to="/landing"
        className="hover:text-[#2D6A4F] flex items-center justify-center gap-1"
      >
        <i className="ri-arrow-left-line" />
        {label}
      </Link>
    </p>
  );
}

export default function LoginFormPanel({
  form,
  errors,
  loading,
  passkeyLoading,
  passkeyError,
  socialAuthInFlight,
  savedAccounts,
  hasSavedAccounts,
  viewMode,
  passwordAccount,
  savePassword,
  onSavePasswordChange,
  onChange,
  onSubmit,
  onSocialLogin,
  onSelectSavedAccount,
  onSelectSocialAccount,
  onSelectPasskeyAccount,
  onPasskeyRetry,
  onUseAnotherAccount,
  onBackToSaved,
}) {
  const { t } = useLanguage();

  const backHomeFooter = <BackHomeLink label={t("auth.backHome")} />;

  // ── VIEW: Saved accounts ───────────────────────────────────────────
  if (viewMode === "saved" && hasSavedAccounts) {
    return (
      <LoginShell footer={backHomeFooter}>
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332]">
            {t("auth.login.welcomeBack")}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
            {t("auth.login.chooseAccount")}
          </p>
        </div>

        <SavedAccountSelector
          accounts={savedAccounts}
          passkeyLoading={passkeyLoading}
          onSelect={onSelectSavedAccount}
          onSocialSelect={onSelectSocialAccount}
          onPasskeySelect={onSelectPasskeyAccount}
          onUseAnother={onUseAnotherAccount}
        />

        {passkeyError && !passkeyLoading && (
          <div className="mt-3 flex items-center justify-between gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs">
            <span className="text-red-600 truncate">{passkeyError}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onPasskeyRetry}
                className="font-semibold text-[#2D6A4F] hover:underline whitespace-nowrap"
              >
                {t("common.retry")}
              </button>
              <button
                type="button"
                onClick={onUseAnotherAccount}
                className="font-semibold text-gray-500 hover:text-gray-700 hover:underline whitespace-nowrap"
              >
                {t("auth.login.usePasswordInstead")}
              </button>
            </div>
          </div>
        )}
      </LoginShell>
    );
  }

  // ── VIEW: Password for saved account ───────────────────────────────
  if (viewMode === "password" && passwordAccount) {
    return (
      <LoginShell footer={backHomeFooter}>
        <button
          type="button"
          onClick={onBackToSaved}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#2D6A4F] font-medium mb-4 cursor-pointer"
        >
          <i className="ri-arrow-left-line" />
          {t("auth.login.backToSaved")}
        </button>

        <div className="flex items-center gap-3 mb-5">
          <Avatar
            src={passwordAccount.avatar}
            name={passwordAccount.displayName}
            size="sm"
          />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">
              {t("auth.login.signInAs")}
            </p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {passwordAccount.email}
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <ErrorAlert message={errors.general} />

          <PasswordInput
            label={t("auth.passwordLabel")}
            name="password"
            value={form.password}
            onChange={onChange}
            error={errors.password}
          />

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={savePassword}
              onChange={(e) => onSavePasswordChange?.(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#2D6A4F] focus:ring-[#2D6A4F] cursor-pointer"
            />
            <span className="text-xs text-gray-600">
              {t("auth.login.savePassword")}
            </span>
          </label>

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
            className={`w-full ${authPrimaryButtonClass}`}
          >
            <i className="ri-login-box-line" />
            {loading ? t("auth.login.signingIn") : t("auth.login.signIn")}
          </button>
        </form>
      </LoginShell>
    );
  }

  // ── VIEW: Normal login form ────────────────────────────────────────
  return (
    <LoginShell footer={backHomeFooter}>
      {hasSavedAccounts && (
        <button
          type="button"
          onClick={onBackToSaved}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#2D6A4F] font-medium mb-4 cursor-pointer"
        >
          <i className="ri-arrow-left-line" />
          {t("auth.login.backToSaved")}
        </button>
      )}

      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332]">
          {t("auth.login.welcomeBack")}
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
          {t("auth.login.subtitle")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
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

        <PasswordInput
          label={t("auth.passwordLabel")}
          name="password"
          value={form.password}
          onChange={onChange}
          error={errors.password}
        />

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={savePassword}
            onChange={(e) => onSavePasswordChange?.(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#2D6A4F] focus:ring-[#2D6A4F] cursor-pointer"
          />
          <span className="text-xs text-gray-600">
            {t("auth.login.savePassword")}
          </span>
        </label>

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
          disabled={loading || passkeyLoading || socialAuthInFlight}
          className={`w-full ${authPrimaryButtonClass}`}
        >
          <i className="ri-login-box-line" />
          {loading ? t("auth.login.signingIn") : t("auth.login.signIn")}
        </button>
      </form>

      <div className="flex items-center gap-3 py-3 text-xs">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-gray-400 font-medium whitespace-nowrap">
          {t("auth.login.orContinueWith")}
        </span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={() => onSocialLogin?.("google")}
          disabled={socialAuthInFlight || loading || passkeyLoading}
          className={`w-full justify-center ${authSocialButtonClass}`}
          aria-label={t("auth.login.continueWithGoogle")}
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-gray-800 font-medium">
            {t("auth.login.continueWithGoogle")}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSocialLogin?.("facebook")}
          disabled={socialAuthInFlight || loading || passkeyLoading}
          className={`w-full justify-center ${authSocialButtonClass}`}
          aria-label={t("auth.login.continueWithFacebook")}
        >
          <i className="ri-facebook-circle-fill text-[#1877F2] text-xl shrink-0" />
          <span className="text-gray-800 font-medium">
            {t("auth.login.continueWithFacebook")}
          </span>
        </button>
      </div>

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
    </LoginShell>
  );
}
