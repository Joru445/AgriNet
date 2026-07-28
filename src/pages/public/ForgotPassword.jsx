import { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../services/forgot-password.service";

import { showToast } from "../../utils/toast";
import logo from "../../assets/favicon.ico";

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
      <div className="hidden lg:flex lg:w-5/12 bg-[#1B4332] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white"></div>
        </div>

        <Link className="flex items-center gap-2 relative z-10" to="/">
          <img
            src={logo}
            alt="AgriNet Logo"
            className="h-10 w-10 object-contain"
          />
          <span className="font-bold text-white text-lg">
            AgriNet <span className="font-light">Lucena</span>
          </span>
        </Link>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-10">
          <img
            src="https://readdy.ai/api/search-image?query=Filipino%20farmer%20holding%20fresh%20vegetables%20basket%20smiling%2C%20lush%20green%20farm%20background%2C%20warm%20golden%20sunlight%2C%20vibrant%20colors%2C%20authentic%20Philippine%20agricultural%20scene%2C%20happy%20and%20prosperous&width=500&height=500&seq=auth1&orientation=squarish"
            alt="Farmer illustration"
            className="w-72 h-72 object-cover object-top rounded-2xl mb-8"
          />

          <h2 className="text-white text-2xl font-bold text-center mb-3">
            Join Lucena's Agricultural Community
          </h2>

          <p className="text-green-200/80 text-center text-sm leading-relaxed max-w-xs">
            Connect directly with local farmers and consumers. Fresh produce,
            fair prices, no middlemen.
          </p>

          <div className="flex gap-6 mt-8">
            <div className="text-center">
              <p className="text-white font-bold text-xl">500+</p>
              <p className="text-green-300 text-xs">Farmers</p>
            </div>

            <div className="text-center">
              <p className="text-white font-bold text-xl">2K+</p>
              <p className="text-green-300 text-xs">Products</p>
            </div>

            <div className="text-center">
              <p className="text-white font-bold text-xl">4.8★</p>
              <p className="text-green-300 text-xs">Rating</p>
            </div>
          </div>
        </div>

        <p className="text-green-200/50 text-xs relative z-10">
          © 2026 AgriNet Lucena
        </p>
      </div>

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
