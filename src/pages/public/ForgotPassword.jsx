import { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../services/forgot-password.service";

import { showToast } from "../../utils/toast";
import logo from "../../assets/favicon.ico";
import landscapeBg from "../../assets/img/landscape.jpg";
import SidePanel from "../../components/auth/SidePanel";

export default function ForgotPassword() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
  });

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
    e.preventDefault();

    try {
      setLoading(true);

      await forgotPassword(form.email);

      showToast.success("Password reset email sent.");
    } catch {
      showToast.error("Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <SidePanel />

      <div
        className="flex-1 relative flex items-center justify-center p-3 sm:p-6 md:p-12 min-h-screen overflow-y-auto"
        style={{ backgroundColor: 'var(--agri-bg-surface)' }}
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
            <h1 className="text-xl sm:text-2xl font-bold text-[#1B4332]">
              Reset your password!
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
                <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2D6A4F] transition-colors"
                />
              </div>

              {errors.email && (
                <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                  <i className="ri-error-warning-line text-sm"></i>
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70 cursor-pointer"
            >
              <i className="ri-login-box-line"></i>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-3 sm:mt-4">
            <Link
              to="/login"
              className="hover:text-[#2D6A4F] flex items-center justify-center gap-1"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
