import { Link } from "react-router-dom";

import landscape from "../../assets/img/landscape.jpg";

export default function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          alt="Agricultural landscape"
          className="w-full h-full object-cover object-top"
          src={landscape}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B4332]/85 via-[#1B4332]/60 to-[#1B4332]/30" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <i className="ri-leaf-line text-green-300" />
            <span>Direct Farm-to-Table Trading in Lucena City</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Connect
            <span className="text-green-300"> Directly </span> with
            <br className="hidden md:block" />
            Local Farmers
          </h1>

          <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-10 max-w-xl">
            AgriNet Lucena eliminates middlemen, giving farmers fair prices
            and consumers access to the freshest local agricultural products.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-semibold rounded-full transition-all duration-200 whitespace-nowrap text-base"
              to="/register"
            >
              <i className="ri-user-add-line" />
              Get Started
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-sm border-2 border-white/60 text-white font-semibold rounded-full transition-all duration-200 whitespace-nowrap text-base"
              to="/login"
            >
              <i className="ri-store-2-line" />
              Browse Products
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-white/10 border-2 border-white/40 text-white font-semibold rounded-full transition-all duration-200 whitespace-nowrap text-base"
              to="/login"
            >
              <i className="ri-map-pin-line" />
              Find Nearby Farmers
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60 animate-bounce">
        <span className="text-xs">Scroll down</span>
        <i className="ri-arrow-down-line" />
      </div>
    </section>
  );
}
