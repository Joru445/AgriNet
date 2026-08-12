import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { login } from "../../services/login.service";

import { getRoleHome } from "../../utils/routes";

import logo from "../../assets/favicon.ico";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrors({
      email: "",
      password: "",
      general: "",
    });

    try {
      setLoading(true);

      const { profile } = await login(form);

      if (!profile?.role) {
        setErrors({
          email: "",
          password: "",
          general: "Unable to determine your account role.",
        });

        return;
      }

      navigate(getRoleHome(profile.role));
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case "auth/invalid-credential":
          setErrors({
            email: "",
            password: "Invalid email or password.",
            general: "",
          });
          break;

        case "auth/too-many-requests":
          setErrors({
            email: "",
            password: "Too many login attempts. Please try again later.",
            general: "",
          });
          break;

        default:
          setErrors({
            email: "",
            password: "",
            general: "Unable to sign in. Please try again.",
          });
      }
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
            <h1 className="text-2xl font-bold text-[#1B4332]">Welcome Back!</h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600 font-medium flex items-center gap-2">
                    <i className="ri-error-warning-line text-sm"></i>
                    <span>{errors.general}</span>
                  </p>
                </div>
              )}
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

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Password
              </label>

              <div className="relative password-field">
                <i className="ri-lock-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>

                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2D6A4F] transition-colors"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Show Password"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i
                    className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}
                  ></i>
                </button>
              </div>

              {errors.password && (
                <p className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
                  <i className="ri-error-warning-line text-sm"></i>
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-[#2D6A4F] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
            >
              <i className="ri-login-box-line"></i>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              data-route
              className="text-[#2D6A4F] font-semibold hover:underline cursor-pointer"
            >
              Register here
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            <Link
              to="/"
              className="hover:text-[#2D6A4F] flex items-center justify-center gap-1"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
