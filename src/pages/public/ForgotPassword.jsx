import { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../services/forgot-password.service";

import { showToast } from "../../utils/toast";
import logo from "../../assets/favicon.ico";
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

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md pt-6">
          <Link className="flex items-center gap-2 mb-8 lg:hidden" to="/">
            <img
              src={logo}
              alt="AgriNet Logo"
              className="h-8 w-8 object-contain"
            />
            <span className="font-bold text-[#1B4332] text-base">
              AgriNet Lucena
            </span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1B4332]">
              Reset your password!
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              We will send a reset link to your email address.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
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
              className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
            >
              <i className="ri-login-box-line"></i>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
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
