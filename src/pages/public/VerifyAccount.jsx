import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { sendVerificationEmail } from "../../services/auth.service";
import { getRoleHome } from "../../utils/routes";
import { showToast } from "../../utils/toast";

import logo from "../../assets/favicon.ico";
import landscapeBg from "../../assets/img/landscape.jpg";
import SidePanel from "../../components/auth/SidePanel";
import Loading from "../../components/Loading";

export default function VerifyAccount() {
  const { user, profile, loading, suspended, emailVerified, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  // Cooldown timer countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (loading) {
    return <Loading />;
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If suspended, redirect to suspended page
  if (suspended) {
    return <Navigate to="/suspended" replace />;
  }

  // If already verified, redirect to role home
  if (emailVerified) {
    return <Navigate to={getRoleHome(profile?.role)} replace />;
  }

  async function handleCheckVerification() {
    if (checking) return;

    try {
      setChecking(true);
      const reloadedUser = await refreshUser();

      if (reloadedUser?.emailVerified) {
        showToast.success("Email verified successfully! Welcome to AgriNet.");
        navigate(getRoleHome(profile?.role), { replace: true });
      } else {
        showToast.info("Email is not verified yet. Please check your inbox or spam folder and click the verification link.");
      }
    } catch (error) {
      console.error("Verification check failed:", error);
      showToast.error("Unable to check verification status. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function handleResendEmail() {
    if (resending || cooldown > 0) return;

    try {
      setResending(true);
      await sendVerificationEmail(user);
      setCooldown(60);
      showToast.success("Verification link sent! Please check your inbox and spam folder.");
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      if (error.code === "auth/too-many-requests") {
        setCooldown(60);
        showToast.error("Too many requests. Please wait a minute before requesting another email.");
      } else {
        showToast.error(error.message || "Failed to send verification email. Please try again.");
      }
    } finally {
      setResending(false);
    }
  }

  async function handleSignOut() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      showToast.error("Failed to sign out.");
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
          {/* Brand header */}
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

          {/* Mail Icon */}
          <div className="mx-auto mb-3.5 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[#E8F5EC] text-[#2D6A4F] shadow-inner text-3xl">
            <i className="ri-mail-send-line" />
          </div>

          {/* Heading */}
          <div className="text-center mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332]">
              Verify Your Email Address
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1">
              We sent a verification link to:
            </p>
            <div className="mt-1.5 sm:mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 font-semibold text-xs sm:text-sm border border-gray-200 break-all">
              <i className="ri-mail-line text-gray-500 shrink-0 text-sm" />
              <span>{user?.email}</span>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mt-2 sm:mt-2.5 leading-relaxed">
              Please click the link in your email to activate your account and access the AgriNet marketplace.
            </p>
          </div>

          {/* Check Spam / Junk Folder Tip Banner */}
          <div className="mb-4 sm:mb-5 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900 flex items-start gap-2.5 shadow-xs">
            <i className="ri-information-line text-base text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed text-left">
              <p className="font-bold text-amber-900">Can't find the email?</p>
              <p className="text-amber-800 mt-0.5">
                Please check your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder if the verification email doesn't appear in your primary inbox.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-2.5">
            <button
              type="button"
              disabled={checking}
              onClick={handleCheckVerification}
              className="w-full py-2.5 sm:py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-sm disabled:opacity-70 cursor-pointer"
            >
              <i className={`ri-${checking ? "loader-4-line animate-spin" : "checkbox-circle-line"} text-sm sm:text-base`} />
              {checking ? "Checking Status..." : "I've Verified My Email"}
            </button>

            <button
              type="button"
              disabled={resending || cooldown > 0}
              onClick={handleResendEmail}
              className="w-full py-2.5 sm:py-3 border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F]/5 font-semibold rounded-xl transition-all duration-200 text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <i className={`ri-${resending ? "loader-4-line animate-spin" : "refresh-line"} text-sm sm:text-base`} />
              {resending
                ? "Sending Email..."
                : cooldown > 0
                  ? `Resend Email in ${cooldown}s`
                  : "Resend Verification Email"}
            </button>
          </div>

          {/* Logout / Switch account option */}
          <div className="mt-4 pt-3 sm:mt-5 sm:pt-4 border-t border-gray-100 text-center">
            <p className="text-[11px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">
              Entered the wrong email address or need to switch accounts?
            </p>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loggingOut}
              className="text-[11px] sm:text-xs font-semibold text-gray-600 hover:text-red-600 inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <i className="ri-logout-box-r-line" />
              {loggingOut ? "Signing out..." : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

