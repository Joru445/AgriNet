import { Link } from "react-router-dom";

import logo from "../../assets/favicon.ico";

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
  return (
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

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <ErrorAlert message={errors.general} />

            <FormInput
              label="Email Address"
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
            label="Password"
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
  );
}
