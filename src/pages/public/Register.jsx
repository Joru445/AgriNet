import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { register } from "../../services/register.service";

import { showToast } from "../../utils/toast";
import logo from "../../assets/favicon.ico";

export default function RegisterPage() {
  const [form, setForm] = useState({
    role: "consumer",
    fullName: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasLength = form.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(form.password);
  const hasLowercase = /[a-z]/.test(form.password);
  const hasNumber = /\d/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await register(form);

      showToast.success("Account created successfully!");

      navigate("/login");
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          showToast.error("Email is already registered.");
          break;

        case "auth/weak-password":
          showToast.error("Password is too weak.");
          break;

        default:
          showToast.error("Failed to create account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-screen flex">
      <div className="hidden lg:flex lg:w-5/12 max-h-screen bg-[#1B4332] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-white"></div>
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white"></div>
        </div>
        <Link className="flex items-center gap-2 relative z-10" to="/">
          <img
            alt="AgriNet Logo"
            className="h-10 w-10 object-contain"
            src={logo}
          />
          <span className="font-bold text-white text-lg">
            AgriNet <span className="font-light">Lucena</span>
          </span>
        </Link>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center py-10">
          <img
            alt="Farmer illustration"
            className="w-72 h-72 object-cover object-top rounded-2xl mb-8"
            src="https://readdy.ai/api/search-image?query=Filipino%20farmer%20holding%20fresh%20vegetables%20basket%20smiling%2C%20lush%20green%20farm%20background%2C%20warm%20golden%20sunlight%2C%20vibrant%20colors%2C%20authentic%20Philippine%20agricultural%20scene%2C%20happy%20and%20prosperous&amp;width=500&amp;height=500&amp;seq=auth1&amp;orientation=squarish"
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

      <div className="flex-1 flex items-center justify-center p-6 overflow-scroll md:p-12 bg-white">
        <div className="w-full max-w-md">
          <Link className="flex items-center gap-2 mb-8 lg:hidden" to="/">
            <img
              alt="AgriNet Logo"
              className="h-8 w-8 object-contain"
              src={logo}
            />
            <span className="font-bold text-[#1B4332] text-base">
              AgriNet Lucena
            </span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1B4332]">
              Create Your Account
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Join AgriNet Lucena today.
            </p>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              I am a...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    role: "farmer",
                  }))
                }
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  form.role === "farmer"
                    ? "border-[#2D6A4F] bg-[#D8F3DC]"
                    : "border-gray-200"
                }`}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    form.role === "farmer" ? "bg-[#2D6A4F]" : "bg-gray-100"
                  }`}
                >
                  <i
                    className={`ri-plant-line ${
                      form.role === "farmer" ? "text-white" : "text-gray-500"
                    }`}
                  ></i>
                </div>
                <span className="text-sm font-semibold capitalize text-gray-600">
                  farmer
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    role: "consumer",
                  }))
                }
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                  form.role === "consumer"
                    ? "border-[#2D6A4F] bg-[#D8F3DC]"
                    : "border-gray-200"
                }`}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    form.role === "consumer" ? "bg-[#2D6A4F]" : "bg-gray-100"
                  }`}
                >
                  <i
                    className={`ri-shopping-basket-line ${
                      form.role === "consumer" ? "text-white" : "text-gray-500"
                    }`}
                  ></i>
                </div>
                <span className="text-sm font-semibold capitalize text-[#1B4332]">
                  consumer
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Full Name
              </label>
              <div className="relative">
                <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Juan dela Cruz"
                  required
                  className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#2D6A4F] transition-colors"
                />
              </div>
            </div>

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

              <ul className="pt-1 text-sm text-gray-400 cursor-pointer">
                <li className={hasLength ? "text-green-600" : "text-gray-400"}>
                  <i
                    className={hasLength ? "ri-check-line" : "ri-close-line"}
                  ></i>
                  At least 8 characters
                </li>

                <li
                  className={hasUppercase ? "text-green-600" : "text-gray-400"}
                >
                  <i
                    className={hasUppercase ? "ri-check-line" : "ri-close-line"}
                  ></i>
                  Uppercase letter
                </li>

                <li
                  className={hasLowercase ? "text-green-600" : "text-gray-400"}
                >
                  <i
                    className={hasLowercase ? "ri-check-line" : "ri-close-line"}
                  ></i>
                  Lowercase letter
                </li>

                <li className={hasNumber ? "text-green-600" : "text-gray-400"}>
                  <i
                    className={hasNumber ? "ri-check-line" : "ri-close-line"}
                  ></i>
                  Number
                </li>

                <li className={hasSpecial ? "text-green-600" : "text-gray-400"}>
                  <i
                    className={hasSpecial ? "ri-check-line" : "ri-close-line"}
                  ></i>
                  Special character
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-bold rounded-full transition-all duration-200 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?
            <Link
              className="text-[#2D6A4F] font-semibold hover:underline cursor-pointer"
              to="/login"
            >
              Sign in
            </Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-4">
            <Link
              className="hover:text-[#2D6A4F] flex items-center justify-center gap-1"
              to="/"
            >
              <i className="ri-arrow-left-line"></i> Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
