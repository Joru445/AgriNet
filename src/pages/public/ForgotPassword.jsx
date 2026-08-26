import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../services/forgot-password.service";

import { showToast } from "../../utils/toast";
import logo from "../../assets/favicon.ico";
import landscapeBg from "../../assets/img/landscape.jpg";
import SidePanel from "../../components/auth/SidePanel";

export default function ForgotPassword() {
  const [form, setForm] = useState({
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [errors, setErrors] = useState({
    email: "",
  });

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!form.email || loading) return;

    try {
      setLoading(true);

      await forgotPassword(form.email);

      setIsSent(true);
      setCooldown(60);
      showToast.success("Password reset link sent! Please check your inbox and spam folder.");
    } catch (error) {
      console.error("Failed to send reset email:", error);
      if (error?.code === "auth/too-many-requests") {
        setCooldown(60);
        showToast.error("Too many requests. Please wait a minute before requesting another reset email.");
      } else {
        showToast.error(error?.message || "Unable to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <SidePanel />

      <div
        className="flex-1 relative flex items-center justify-center p-4 sm:p-6 md:p-12 min-h-screen"
        style={{ backgroundColor: "var(--agri-bg-surface)" }}
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

          {!isSent ? (
            /* Email Input Form */
            <>
              <div className="mb-4 sm:mb-5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332]">
                  Reset your password
                </h1>
                <p className="text-gray-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  We will send a reset link to your email address.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Email Address
                  </label>

                  <div className="relative">
                    <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#2D6A4F] transition-colors"
                    />
                  </div>

                  {errors.email && (
                    <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                      <i className="ri-error-warning-line text-sm" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-70 cursor-pointer"
                >
                  <i className={`ri-${loading ? "loader-4-line animate-spin" : "send-plane-line"} text-sm sm:text-base`} />
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-4 sm:mt-5">
                <Link
                  to="/login"
                  className="hover:text-[#2D6A4F] inline-flex items-center justify-center gap-1 font-semibold transition-colors"
                >
                  <i className="ri-arrow-left-line" />
                  Back to Sign in
                </Link>
              </p>
            </>
          ) : (
            /* Reset Link Sent Confirmation (Same as Verify Account layout) */
            <>
              {/* Mail Icon */}
              <div className="mx-auto mb-3.5 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#E8F5EC] text-[#2D6A4F] shadow-inner text-3xl">
                <i className="ri-mail-send-line" />
              </div>

              {/* Heading */}
              <div className="text-center mb-4 sm:mb-5">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332]">
                  Password Reset Link Sent
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  We sent a reset link to:
                </p>
                <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 font-semibold text-xs sm:text-sm border border-gray-200 break-all">
                  <i className="ri-mail-line text-gray-500 shrink-0 text-sm" />
                  <span>{form.email}</span>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm mt-2 sm:mt-2.5 leading-relaxed">
                  Please click the link in your email to reset your password and secure your AgriNet account.
                </p>
              </div>

              {/* Check Spam / Junk Folder Tip Banner */}
              <div className="mb-4 sm:mb-5 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
                <i className="ri-information-line text-base text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed text-left">
                  <p className="font-bold text-amber-900">Can't find the email?</p>
                  <p className="text-amber-800 mt-0.5">
                    Please check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder if the password reset email doesn't appear in your primary inbox.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-2.5">
                <button
                  type="button"
                  disabled={loading || cooldown > 0}
                  onClick={() => handleResetPassword()}
                  className="w-full py-2.5 sm:py-3 border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F]/5 font-semibold rounded-xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <i className={`ri-${loading ? "loader-4-line animate-spin" : "refresh-line"} text-sm sm:text-base`} />
                  {loading
                    ? "Sending Email..."
                    : cooldown > 0
                      ? `Resend Email in ${cooldown}s`
                      : "Resend Reset Link"}
                </button>

                <Link
                  to="/login"
                  className="w-full py-2.5 sm:py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-sm cursor-pointer no-underline"
                >
                  <i className="ri-arrow-left-line text-sm sm:text-base" />
                  Back to Sign in
                </Link>
              </div>

              {/* Re-enter Email Option */}
              <div className="mt-4 pt-3 sm:mt-5 sm:pt-4 border-t border-gray-100 text-center">
                <p className="text-[11px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">
                  Entered the wrong email address?
                </p>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="text-[11px] sm:text-xs font-semibold text-gray-600 hover:text-[#2D6A4F] inline-flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <i className="ri-edit-line" />
                  Try another email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
