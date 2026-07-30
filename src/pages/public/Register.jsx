import { Link } from "react-router-dom";

import useRegisterForm from "../../hooks/useRegisterForm";

import AccountStep from "../../components/register/AccountStep";
import PasswordStep from "../../components/register/PasswordStep";
import ProfileStep from "../../components/register/ProfileStep";

import logo from "../../assets/favicon.ico";

export default function Register() {
  const {
    step,
    loading,
    form,

    updateField,
    updateLocation,

    nextStep,
    previousStep,

    submit,
  } = useRegisterForm();

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#1B4332] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white" />
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full bg-white" />
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

        <div className="relative z-10 flex-1 flex flex-col justify-center items-center py-10">
          <img
            src="https://readdy.ai/api/search-image?query=Filipino%20farmer%20holding%20fresh%20vegetables%20basket%20smiling%2C%20lush%20green%20farm%20background%2C%20warm%20golden%20sunlight%2C%20vibrant%20colors%2C%20authentic%20Philippine%20agricultural%20scene%2C%20happy%20and%20prosperous&width=500&height=500&seq=auth1&orientation=squarish"
            alt="Farmer"
            className="w-72 h-72 object-cover object-top rounded-2xl mb-8"
          />

          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Join Lucena's Agricultural Community
          </h2>

          <p className="text-green-200/80 text-center text-sm max-w-xs">
            Connect directly with local farmers and consumers. Fresh produce,
            fair prices, no middlemen.
          </p>

          <div className="flex gap-6 mt-8">
            <div className="text-center">
              <p className="text-xl font-bold text-white">500+</p>
              <p className="text-xs text-green-300">Farmers</p>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold text-white">2K+</p>
              <p className="text-xs text-green-300">Products</p>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold text-white">4.8★</p>
              <p className="text-xs text-green-300">Rating</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-green-200/50 relative z-10">
          © 2026 AgriNet Lucena
        </p>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto p-6 md:p-12 bg-white">
        <div className="w-full max-w-md pt-6">
          <Link className="flex items-center gap-2 mb-8 lg:hidden" to="/">
            <img
              src={logo}
              alt="AgriNet Logo"
              className="h-8 w-8 object-contain"
            />

            <span className="font-bold text-[#1B4332]">AgriNet</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1B4332]">
              Create Your Account
            </h1>

            <p className="text-gray-500 text-sm mt-1">Join AgriNet today.</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((number) => (
              <div key={number} className="flex flex-1 items-center">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-semibold transition
                    ${
                      step >= number
                        ? "bg-[#2D6A4F]/80 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                >
                  {number}
                </div>

                {number < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded
                      ${step > number ? "bg-[#2D6A4F]" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
            <div
              className={`h-7 w-7 rounded-full flex justify-center transition bg-gray-100 text-gray-500`}
            ></div>
          </div>

          {step === 1 && (
            <AccountStep
              form={form}
              updateField={updateField}
              onContinue={nextStep}
            />
          )}

          {step === 2 && (
            <PasswordStep
              form={form}
              errors={{}}
              onChange={(e) => updateField(e.target.name, e.target.value)}
              onBack={previousStep}
              onContinue={nextStep}
            />
          )}

          {step === 3 && (
            <ProfileStep
              form={form}
              loading={loading}
              updateField={updateField}
              updateLocation={updateLocation}
              onBack={previousStep}
              onSubmit={submit}
            />
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/register"
              className="text-[#2D6A4F] font-semibold hover:underline cursor-pointer"
            >
              Sign in
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
