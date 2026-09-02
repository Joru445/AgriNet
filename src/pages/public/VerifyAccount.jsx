import { useEffect, useState, useRef } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  initPhoneRecaptcha,
  resetPhoneRecaptcha,
  sendPhoneVerificationOtp,
  verifyAndLinkPhone,
  sendVerificationEmail,
} from "../../services/auth.service";
import {
  normalizePhilippinePhoneNumber,
  formatPhilippinePhoneNumber,
} from "../../utils/phone";
import { getRoleHome } from "../../utils/routes";
import { showToast } from "../../utils/toast";
import { useLanguage } from "../../context/LanguageContext";

import logo from "../../assets/favicon.ico";
import landscapeBg from "../../assets/img/landscape.jpg";
import SidePanel from "../../components/auth/SidePanel";
import Loading from "../../components/Loading";

export default function VerifyAccount() {
  const { t } = useLanguage();
  const {
    user,
    profile,
    loading,
    suspended,
    phoneVerified,
    emailVerified,
    refreshAuthUser,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  // Step state: "phone" (enter number) or "otp" (enter code)
  const [step, setStep] = useState("phone");

  // Phone number state prefilled with profile phone or empty
  const [phoneInput, setPhoneInput] = useState(() => {
    return profile?.phone || user?.phoneNumber || "";
  });

  const [phoneError, setPhoneError] = useState("");

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [normalizedPhone, setNormalizedPhone] = useState("");

  // Loading & Timer states
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  const otpInputRef = useRef(null);

  // Sync profile phone when loaded if empty
  useEffect(() => {
    if (!phoneInput && profile?.phone) {
      setPhoneInput(profile.phone);
    }
  }, [profile?.phone, phoneInput]);

  // Resend OTP Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Email verification Cooldown timer
  useEffect(() => {
    if (emailCooldown <= 0) return;
    const timer = setInterval(() => {
      setEmailCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [emailCooldown]);

  // Auto-focus OTP input when entering OTP step
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [step]);

  // Clean up reCAPTCHA verifier on component unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          /* noop */
        }
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  if (loading) {
    return <Loading />;
  }

  // 1. If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If suspended, redirect to suspended page
  if (suspended) {
    return <Navigate to="/suspended" replace />;
  }

  // 3. If phone is already verified, redirect to role home
  if (phoneVerified) {
    return <Navigate to={getRoleHome(profile?.role)} replace />;
  }

  /**
   * Handle sending OTP code
   */
  async function handleSendOtp(e) {
    e?.preventDefault();
    if (sendingOtp) return;

    setPhoneError("");
    setOtpError("");

    const normalized = normalizePhilippinePhoneNumber(phoneInput);
    if (!normalized) {
      setPhoneError(t("auth.errors.phoneInline"));
      return;
    }

    try {
      setSendingOtp(true);

      const recaptchaVerifier = initPhoneRecaptcha("recaptcha-container");
      if (!recaptchaVerifier) {
        throw new Error(t("auth.errors.recaptcha"));
      }

      const confirmResult = await sendPhoneVerificationOtp(
        normalized,
        recaptchaVerifier
      );

      setConfirmationResult(confirmResult);
      setNormalizedPhone(normalized);
      setStep("otp");
      setResendCooldown(60);
      showToast.success(
        t("auth.verify.toastSent", {
          phone: formatPhilippinePhoneNumber(normalized),
        })
      );
    } catch (error) {
      console.error("Failed to send OTP:", error);
      resetPhoneRecaptcha();

      if (error.code === "auth/invalid-phone-number") {
        setPhoneError(t("auth.errors.phoneFormat"));
      } else if (error.code === "auth/too-many-requests") {
        setPhoneError(t("auth.errors.smsTooMany"));
      } else if (error.code === "auth/quota-exceeded") {
        setPhoneError(t("auth.errors.smsQuota"));
      } else if (error.code === "auth/operation-not-allowed") {
        setPhoneError(t("auth.errors.smsNotEnabled"));
      } else if (error.code === "auth/billing-not-enabled") {
        setPhoneError(t("auth.errors.smsBlaze"));
      } else if (error.code?.includes("-39") || error.code === "auth/invalid-app-credential") {
        setPhoneError(t("auth.errors.smsCheckFailed"));
      } else {
        setPhoneError(error.message || t("auth.errors.smsFailed"));
      }
    } finally {
      setSendingOtp(false);
    }
  }

  /**
   * Handle verifying OTP and linking phone credential
   */
  async function handleVerifyOtp(e) {
    e?.preventDefault();
    if (verifyingOtp) return;

    const cleanedCode = otpCode.trim();
    if (!cleanedCode || cleanedCode.length !== 6 || !/^\d{6}$/.test(cleanedCode)) {
      setOtpError(t("auth.errors.otpIncomplete"));
      return;
    }

    setOtpError("");

    try {
      setVerifyingOtp(true);

      await verifyAndLinkPhone(
        confirmationResult,
        cleanedCode,
        normalizedPhone,
        user
      );

      // Refresh Auth User state to immediately reflect phone verification
      await refreshAuthUser();

      showToast.success(t("auth.verify.toastSuccess"));
      navigate(getRoleHome(profile?.role), { replace: true });
    } catch (error) {
      console.error("Failed to verify OTP code:", error);

      if (
        error.code === "auth/credential-already-in-use" ||
        error.code === "auth/phone-number-already-exists" ||
        error.code === "auth/account-exists-with-different-credential"
      ) {
        setOtpError(t("auth.errors.phoneTaken"));
        showToast.error(t("auth.errors.phoneTaken"));
      } else if (error.code === "auth/invalid-verification-code") {
        setOtpError(t("auth.errors.otpInvalid"));
      } else if (error.code === "auth/code-expired") {
        setOtpError(t("auth.errors.otpExpired"));
      } else {
        setOtpError(error.message || t("auth.errors.verifyFailed"));
      }
    } finally {
      setVerifyingOtp(false);
    }
  }

  /**
   * Handle optional email verification sending
   */
  async function handleSendEmailVerification() {
    if (resendingEmail || emailCooldown > 0) return;

    try {
      setResendingEmail(true);
      await sendVerificationEmail(user);
      setEmailCooldown(60);
      showToast.success(t("auth.verify.toastEmailSent"));
    } catch (error) {
      console.error("Email verification send error:", error);
      if (error.code === "auth/too-many-requests") {
        setEmailCooldown(60);
        showToast.error(t("auth.errors.emailTooMany"));
      } else {
        showToast.error(error.message || t("auth.errors.emailSendFailed"));
      }
    } finally {
      setResendingEmail(false);
    }
  }

  /**
   * Handle Sign Out
   */
  async function handleSignOut() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      showToast.error(t("auth.errors.logoutFailed"));
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      <SidePanel />

      <div
        className="flex-1 relative flex items-center justify-center p-4 sm:p-6 md:p-12 min-h-screen"
        style={{ backgroundColor: "var(--agri-bg-surface)" }}
      >
        {/* Mobile-only background */}
        <div className="absolute inset-0 lg:hidden pointer-events-none overflow-hidden">
          <img
            src={landscapeBg}
            alt="Agricultural background"
            className="w-full h-full object-cover object-center scale-105 blur-[1.5px]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e1a]/85 via-[#1B4332]/75 to-[#2D6A4F]/65" />
        </div>

        <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md border border-white/60 shadow-2xl rounded-2xl p-5 sm:p-7 md:p-9 lg:bg-white lg:border-transparent lg:shadow-xl lg:backdrop-blur-none my-auto">
          {/* Mobile Logo */}
          <div className="border-b-2 border-[#1B4332]/20 pb-3 mb-3.5 sm:pb-4 sm:mb-5 lg:hidden">
            <Link className="flex items-center gap-2.5 no-underline hover:no-underline" to="/">
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

          {/* Icon */}
          <div className="mx-auto mb-3.5 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#E8F5EC] text-[#2D6A4F] shadow-inner text-3xl">
            <i className={step === "otp" ? "ri-message-3-line" : "ri-shield-check-line"} />
          </div>

          {/* Heading */}
          <div className="text-center mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332]">
              {step === "otp" ? t("auth.verify.otpTitle") : t("auth.verify.title")}
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed">
              {step === "otp" ? (
                <>
                  {t("auth.verify.otpSentTo")}{" "}
                  <strong className="text-gray-900 break-all">
                    {formatPhilippinePhoneNumber(normalizedPhone)}
                  </strong>
                </>
              ) : (
                t("auth.verify.subtitle")
              )}
            </p>
          </div>

          {/* STEP 1: Enter Phone Number */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t("auth.verify.mobileLabel")} <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <i className="ri-phone-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder={t("auth.verify.mobilePlaceholder")}
                    value={phoneInput}
                    onFocus={() => {
                      if (phoneError) setPhoneError("");
                    }}
                    onChange={(e) => {
                      setPhoneInput(e.target.value);
                      if (phoneError) setPhoneError("");
                    }}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none transition-colors ${
                      phoneError
                        ? "border-red-500 bg-red-50/20"
                        : "border-gray-300 focus:border-[#2D6A4F]"
                    }`}
                  />
                </div>

                {phoneError && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <i className="ri-error-warning-line text-xs" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              {/* reCAPTCHA container */}
              <div id="recaptcha-container" />

              <button
                type="submit"
                disabled={sendingOtp || !phoneInput.trim()}
                className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-70 cursor-pointer"
              >
                {sendingOtp ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-base" />
                    <span>{t("auth.verify.sendingCode")}</span>
                  </>
                ) : (
                  <>
                    <i className="ri-send-plane-fill text-base" />
                    <span>{t("auth.verify.sendCode")}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter 6-Digit OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t("auth.verify.otpLabel")} <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <i className="ri-key-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setOtpCode(val);
                      if (otpError) setOtpError("");
                    }}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-center text-lg font-bold tracking-widest text-gray-900 focus:outline-none transition-colors ${
                      otpError
                        ? "border-red-500 bg-red-50/20"
                        : "border-gray-300 focus:border-[#2D6A4F]"
                    }`}
                  />
                </div>

                {otpError && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <i className="ri-error-warning-line text-xs" />
                    <span>{otpError}</span>
                  </p>
                )}
              </div>

              {/* Invisible reCAPTCHA for resend */}
              <div id="recaptcha-container" />

              <div className="space-y-2.5">
                <button
                  type="submit"
                  disabled={verifyingOtp || otpCode.length !== 6}
                  className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-70 cursor-pointer"
                >
                  {verifyingOtp ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-base" />
                      <span>{t("auth.verify.verifying")}</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-checkbox-circle-fill text-base" />
                      <span>{t("auth.verify.verifyContinue")}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone");
                      setOtpCode("");
                      setOtpError("");
                    }}
                    className="text-gray-600 hover:text-[#2D6A4F] font-semibold cursor-pointer transition-colors inline-flex items-center gap-1"
                  >
                    <i className="ri-arrow-left-line" />
                    {t("auth.verify.changePhone")}
                  </button>

                  <button
                    type="button"
                    disabled={sendingOtp || resendCooldown > 0}
                    onClick={handleSendOtp}
                    className="text-[#2D6A4F] hover:text-[#1B4332] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sendingOtp
                      ? t("auth.sending")
                      : resendCooldown > 0
                        ? t("auth.verify.resendIn", { count: resendCooldown })
                        : t("auth.verify.resendCode")}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Optional Email Status / Resend Link */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <i
                  className={`text-base shrink-0 ${
                    emailVerified
                      ? "ri-mail-check-fill text-emerald-600"
                      : "ri-mail-line text-gray-400"
                  }`}
                />
                <div className="truncate">
                  <p className="font-semibold text-gray-800 truncate">
                    {user?.email}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {emailVerified
                      ? t("auth.verify.emailVerified")
                      : t("auth.verify.emailOptional")}
                  </p>
                </div>
              </div>

              {!emailVerified && (
                <button
                  type="button"
                  disabled={resendingEmail || emailCooldown > 0}
                  onClick={handleSendEmailVerification}
                  className="shrink-0 text-xs font-bold text-[#2D6A4F] hover:underline disabled:opacity-50 cursor-pointer"
                >
                  {resendingEmail
                    ? t("auth.sending")
                    : emailCooldown > 0
                      ? `${emailCooldown}s`
                      : t("auth.verify.sendLink")}
                </button>
              )}
            </div>
          </div>

          {/* Sign out */}
          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loggingOut}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <i className="ri-logout-box-r-line" />
              {loggingOut ? t("auth.signingOut") : t("auth.signOut")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
