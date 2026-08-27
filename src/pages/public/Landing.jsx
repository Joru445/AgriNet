import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import logo from "../../assets/favicon.svg"
import landscape from "../../assets/img/landscape.jpg"

export default function LandingPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`
        fixed top-0 w-full z-50 transition-all duration-300
        ${isScrolled ? "bg-white/70 backdrop-blur-md shadow-xs border-b border-black/5" : "bg-transparent"}
      `}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
          <a className="flex items-center gap-2 cursor-pointer" href="/">
            <img
              alt="AgriNet Lucena Logo"
              className="h-10 w-10 object-contain"
              src={logo}
            />
            <span className={`
              font-bold text-lg whitespace-nowrap transition-colors duration-300
              ${isScrolled ? "text-gray-800" : "text-white"}
            `}>
              AgriNet <span className="font-light">Lucena</span>
            </span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#about"
              className={`
                text-sm font-medium transition-colors duration-200 hover:text-[#2D6A4F] whitespace-nowrap
                ${isScrolled ? "text-gray-800" : "text-white/90"}
            `}>
              About
            </a>
            <a
              href="#how-it-works"
              className={`
                text-sm font-medium transition-colors duration-200 hover:text-[#2D6A4F] whitespace-nowrap
                ${isScrolled ? "text-gray-800" : "text-white/90"}
            `}>
              How It Works
            </a>
            <a
              href="#for-farmers"
              className={`
                text-sm font-medium transition-colors duration-200 hover:text-[#2D6A4F] whitespace-nowrap
                ${isScrolled ? "text-gray-800" : "text-white/90"}
            `}>
              For Farmers
            </a>
            <a
              href="#for-consumers"
              className={`
                text-sm font-medium transition-colors duration-200 hover:text-[#2D6A4F] whitespace-nowrap
                ${isScrolled ? "text-gray-800" : "text-white/90"}
            `}>
              For Consumers
            </a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link
              className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 whitespace-nowrap hover:text-gray-900
                ${isScrolled ? "border-gray-400 text-gray-600 hover:bg-gray-400" : "border-gray-300 text-gray-300 hover:bg-gray-300"}
              `}
              to="/login"
            >
              Login
            </Link>
            <Link
              className="px-5 py-2 rounded-full text-sm font-semibold bg-[#2D6A4F] text-white hover:bg-[#1B4332] transition-all duration-200 whitespace-nowrap"
              to="/register"
            >
              Register
            </Link>
          </div>
          <button
            className={`md:hidden w-10 h-10 flex items-center justify-center focus:outline-none cursor-pointer transition-colors duration-200 ${isScrolled ? "text-gray-800 hover:text-[#2D6A4F]" : "text-white hover:text-green-200"
              }`}
            aria-label="Open menu"
            onClick={() => setIsDrawerOpen(true)}
          >
            <i className="text-2xl ri-menu-line"></i>
          </button>
        </div>
      </header>

      <div
        className={`
        md:hidden fixed bg-black/40 backdrop-blur-xs z-9998 inset-0 transition-all ease-in-out duration-300
        ${isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
        onClick={() => setIsDrawerOpen(false)}
      ></div>

      <div
        className={`
        md:hidden fixed flex flex-col justify-between p-4 sm:p-5 top-0 right-0 w-[78%] max-w-[280px] h-[100dvh] max-h-screen bg-[#1B4332] text-white z-9999 shadow-2xl transition-all ease-in-out duration-300 overflow-y-auto
        ${isDrawerOpen ? "visible translate-x-0" : "invisible translate-x-full"}
      `}
      >
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-end border-b border-white/10 pb-3 mb-3">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white focus:outline-none cursor-pointer rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <nav className="flex flex-col gap-1.5 sm:gap-2 overflow-y-auto">
            <a
              href="#about"
              onClick={() => setIsDrawerOpen(false)}
              className="mobile-drawer-link text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-3 whitespace-nowrap"
            >
              <i className="ri-information-line text-green-300 text-lg"></i>{" "}
              About
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsDrawerOpen(false)}
              className="mobile-drawer-link text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-3 whitespace-nowrap"
            >
              <i className="ri-settings-4-line text-green-300 text-lg"></i> How
              It Works
            </a>
            <a
              href="#for-farmers"
              onClick={() => setIsDrawerOpen(false)}
              className="mobile-drawer-link text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-3 whitespace-nowrap"
            >
              <i className="ri-plant-line text-green-300 text-lg"></i> For
              Farmers
            </a>
            <a
              href="#for-consumers"
              onClick={() => setIsDrawerOpen(false)}
              className="mobile-drawer-link text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-3 whitespace-nowrap"
            >
              <i className="ri-shopping-basket-line text-green-300 text-lg"></i>{" "}
              For Consumers
            </a>
          </nav>
        </div>

        <div className="shrink-0 flex flex-col gap-2.5 pt-3 mt-2 border-t border-white/10">
          <Link
            className="mobile-drawer-link w-full text-center px-4 py-2.5 rounded-full text-xs font-semibold border-2 border-gray-300 text-gray-200 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 whitespace-nowrap"
            to="/login"
            onClick={() => setIsDrawerOpen(false)}
          >
            Login
          </Link>
          <Link
            className="mobile-drawer-link w-full text-center px-4 py-2.5 rounded-full text-xs font-semibold bg-[#2D6A4F] text-white hover:bg-[#1B4332] transition-all duration-200 whitespace-nowrap shadow-sm"
            to="/register"
            onClick={() => setIsDrawerOpen(false)}
          >
            Register
          </Link>
        </div>
      </div>

      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            alt="Agricultural landscape"
            className="w-full h-full object-cover object-top"
            src={landscape}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1B4332]/85 via-[#1B4332]/60 to-[#1B4332]/30"></div>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
              <i className="ri-leaf-line text-green-300"></i>
              <span> Direct Farm-to-Table Trading in Lucena City </span>
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
                <i className="ri-user-add-line"></i>
                Get Started
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-sm border-2 border-white/60 text-white font-semibold rounded-full transition-all duration-200 whitespace-nowrap text-base"
                to="/login"
              >
                <i className="ri-store-2-line"></i>
                Browse Products
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-white/10 border-2 border-white/40 text-white font-semibold rounded-full transition-all duration-200 whitespace-nowrap text-base"
                to="/login"
              >
                <i className="ri-map-pin-line"></i>
                Find Nearby Farmers
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/60 animate-bounce">
          <span className="text-xs"> Scroll down </span>
          <i className="ri-arrow-down-line"></i>
        </div>
      </section>

      <section id="about" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden">
                <img
                  alt="Filipino farmer harvesting vegetables"
                  className="w-full h-100 object-cover object-top"
                  src="https://readdy.ai/api/search-image?query=Filipino%20farmer%20harvesting%20fresh%20vegetables%20in%20a%20lush%20green%20farm%2C%20smiling%2C%20holding%20produce%20basket%2C%20natural%20sunlight%2C%20vibrant%20green%20background%2C%20authentic%20agricultural%20scene%20in%20the%20Philippines&amp;width=600&amp;height=500&amp;seq=about1&amp;orientation=landscape"
                />
              </div>
            </div>
            <div>
              <span className="inline-block text-[#2D6A4F] font-semibold text-sm uppercase tracking-widest mb-3">
                About the Platform
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1B4332] mb-5 leading-tight">
                Empowering Lucena City's Agricultural Community
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                AgriNet Lucena is a web-based platform designed to bridge the
                gap between local farmers and consumers in Lucena City, Quezon
                Province. Our mission is to create a fair, transparent, and
                efficient agricultural trading ecosystem.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                By removing middlemen from the equation, farmers earn more from
                their hard work while consumers enjoy fresher produce at better
                prices. We believe in supporting local agriculture and building
                stronger community ties through technology.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-[#D8F3DC] rounded-lg">
                    <i className="ri-shield-check-line text-[#2D6A4F]"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Verified Farmers
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-[#D8F3DC] rounded-lg">
                    <i className="ri-map-pin-line text-[#2D6A4F]"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Location-Based Discovery
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-[#D8F3DC] rounded-lg">
                    <i className="ri-message-3-line text-[#2D6A4F]"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Direct Communication
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-[#D8F3DC] rounded-lg">
                    <i className="ri-star-line text-[#2D6A4F]"></i>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Trusted Reviews
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="for-farmers" className="py-20 md:py-28 bg-[#F8FAF9] border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-[#2D6A4F] font-semibold text-sm uppercase tracking-widest mb-3">
              Why Choose AgriNet
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B4332]">
              Benefits for Everyone
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-[#1B4332] rounded-xl">
                  <i className="ri-plant-line text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1B4332]">
                    For Farmers
                  </h3>
                  <p className="text-sm text-gray-500">
                    Grow your business directly
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 flex items-center justify-center bg-[#D8F3DC] rounded-lg flex-shrink-0 mt-0.5">
                    <i className="ri-money-dollar-circle-line text-[#2D6A4F] text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Fair Pricing
                    </p>
                    <p className="text-gray-500 text-sm mt-0.5">
                      Set your own prices and earn more without middlemen taking
                      a cut.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 flex items-center justify-center bg-[#D8F3DC] rounded-lg flex-shrink-0 mt-0.5">
                    <i className="ri-store-2-line text-[#2D6A4F] text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Wider Market Reach
                    </p>
                    <p className="text-gray-500 text-sm mt-0.5">
                      Reach consumers across Lucena City directly through our
                      platform.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 flex items-center justify-center bg-[#D8F3DC] rounded-lg flex-shrink-0 mt-0.5">
                    <i className="ri-bar-chart-line text-[#2D6A4F] text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Manage Listings Easily
                    </p>
                    <p className="text-gray-500 text-sm mt-0.5">
                      Add, update, and manage your product listings with a
                      simple dashboard.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 flex items-center justify-center bg-[#D8F3DC] rounded-lg flex-shrink-0 mt-0.5">
                    <i className="ri-message-3-line text-[#2D6A4F] text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      Direct Communication
                    </p>
                    <p className="text-gray-500 text-sm mt-0.5">
                      Chat directly with consumers and respond to inquiries in
                      real time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div id="for-consumers" className="bg-[#1B4332] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-xl">
                  <i className="ri-shopping-basket-line text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    For Consumers
                  </h3>
                  <p className="text-sm text-green-300">
                    Fresh produce at your fingertips
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 flex items-center justify-center bg-white/15 rounded-lg flex-shrink-0 mt-0.5">
                    <i className="ri-leaf-line text-green-300 text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      Fresh Local Produce
                    </p>
                    <p className="text-green-200/80 text-sm mt-0.5">
                      Buy directly from farmers and get the freshest products
                      available.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 flex items-center justify-center bg-white/15 rounded-lg flex-shrink-0 mt-0.5">
                    <i className="ri-price-tag-3-line text-green-300 text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      Better Prices
                    </p>
                    <p className="text-green-200/80 text-sm mt-0.5">
                      No middlemen means lower prices for consumers on quality
                      produce.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 flex items-center justify-center bg-white/15 rounded-lg flex-shrink-0 mt-0.5">
                    <i className="ri-map-pin-line text-green-300 text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      Find Nearby Farmers
                    </p>
                    <p className="text-green-200/80 text-sm mt-0.5">
                      Discover farmers closest to your location for convenient
                      sourcing.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 flex items-center justify-center bg-white/15 rounded-lg flex-shrink-0 mt-0.5">
                    <i className="ri-star-line text-green-300 text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">
                      Trusted Reviews
                    </p>
                    <p className="text-green-200/80 text-sm mt-0.5">
                      Read verified reviews from other consumers before making
                      inquiries.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-28 bg-[#1B4332]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-green-300 font-semibold text-sm uppercase tracking-widest mb-3">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              How It Works
            </h2>
            <p className="text-green-200/80 mt-3 max-w-xl mx-auto">
              Getting started with AgriNet Lucena is quick and easy. Follow
              these four simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative">
              <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] right-[-calc(50%-40px)] h-px border-t-2 border-dashed border-green-600 z-0"></div>
              <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-200">
                <div className="w-16 h-16 flex items-center justify-center bg-[#2D6A4F] rounded-full mx-auto mb-4">
                  <i className="ri-user-add-line text-white text-2xl"></i>
                </div>
                <span className="text-green-300 font-bold text-xs tracking-widest">
                  01
                </span>
                <h3 className="text-white font-bold text-lg mt-1 mb-2">
                  Create Your Account
                </h3>
                <p className="text-green-200/75 text-sm leading-relaxed">
                  Register as a Farmer or Consumer. Farmers set up their farm
                  profile; consumers set up their location.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] right-[-calc(50%-40px)] h-px border-t-2 border-dashed border-green-600 z-0"></div>
              <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-200">
                <div className="w-16 h-16 flex items-center justify-center bg-[#2D6A4F] rounded-full mx-auto mb-4">
                  <i className="ri-store-2-line text-white text-2xl"></i>
                </div>
                <span className="text-green-300 font-bold text-xs tracking-widest">
                  02
                </span>
                <h3 className="text-white font-bold text-lg mt-1 mb-2">
                  Post or Browse Products
                </h3>
                <p className="text-green-200/75 text-sm leading-relaxed">
                  Farmers list their fresh products with prices. Consumers
                  browse and filter by category or location.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] right-[-calc(50%-40px)] h-px border-t-2 border-dashed border-green-600 z-0"></div>
              <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-200">
                <div className="w-16 h-16 flex items-center justify-center bg-[#2D6A4F] rounded-full mx-auto mb-4">
                  <i className="ri-message-3-line text-white text-2xl"></i>
                </div>
                <span className="text-green-300 font-bold text-xs tracking-widest">
                  03
                </span>
                <h3 className="text-white font-bold text-lg mt-1 mb-2">
                  Connect &amp; Inquire
                </h3>
                <p className="text-green-200/75 text-sm leading-relaxed">
                  Consumers send inquiries directly to farmers. Chat in real
                  time to discuss details and availability.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-200">
                <div className="w-16 h-16 flex items-center justify-center bg-[#2D6A4F] rounded-full mx-auto mb-4">
                  <i className="ri-shake-hands-line text-white text-2xl"></i>
                </div>
                <span className="text-green-300 font-bold text-xs tracking-widest">
                  04
                </span>
                <h3 className="text-white font-bold text-lg mt-1 mb-2">
                  Trade Directly
                </h3>
                <p className="text-green-200/75 text-sm leading-relaxed">
                  Agree on terms and complete the transaction directly — no
                  middlemen, no hidden fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="border-t text-gray-800"
        style={{ backgroundColor: 'var(--agri-bg)', borderColor: 'var(--agri-border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 flex justify-center">
          <div className="flex flex-col md:flex-row items-start justify-center gap-10 md:gap-16 lg:gap-24 w-full max-w-5xl">
            <div className="text-left flex-1 min-w-[220px] max-w-[280px]">
              <div className="flex items-center gap-2 mb-4">
                <img
                  alt="AgriNet Logo"
                  className="h-10 w-10 object-contain"
                  src="./src/assets/img/logo.png"
                />
                <span className="font-bold text-lg text-[#1B4332]">
                  AgriNet <span className="font-light">Lucena</span>
                </span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Connecting farmers and consumers in Lucena City for a fairer,
                fresher, and more sustainable agricultural trade.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center bg-white border border-[#d4e8da] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white rounded-full transition-colors duration-200 shadow-xs"
                >
                  <i className="ri-facebook-fill text-sm"></i>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center bg-white border border-[#d4e8da] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white rounded-full transition-colors duration-200 shadow-xs"
                >
                  <i className="ri-twitter-fill text-sm"></i>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center bg-white border border-[#d4e8da] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white rounded-full transition-colors duration-200 shadow-xs"
                >
                  <i className="ri-instagram-line text-sm"></i>
                </a>
              </div>
            </div>
            <div className="text-left flex-1 min-w-[180px] max-w-[240px]">
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#1B4332] mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#about"
                    className="text-gray-600 hover:text-[#2D6A4F] text-sm transition-colors duration-200"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-600 hover:text-[#2D6A4F] text-sm transition-colors duration-200"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="/consumer/dashboard"
                    className="text-gray-600 hover:text-[#2D6A4F] text-sm transition-colors duration-200"
                  >
                    Browse Products
                  </a>
                </li>
                <li>
                  <a
                    href="/farmers/nearby"
                    className="text-gray-600 hover:text-[#2D6A4F] text-sm transition-colors duration-200"
                  >
                    Find Farmers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-[#2D6A4F] text-sm transition-colors duration-200"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div className="text-left flex-1 min-w-[180px] max-w-[240px]">
              <h4 className="font-bold text-sm uppercase tracking-widest text-[#1B4332] mb-4">
                For Users
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    className="text-gray-600 hover:text-[#2D6A4F] text-sm transition-colors duration-200"
                    href="/register"
                    data-route
                  >
                    Registration
                  </a>
                </li>
                <li>
                  <a
                    className="text-gray-600 hover:text-[#2D6A4F] text-sm transition-colors duration-200"
                    href="/login"
                    data-route
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    className="text-gray-600 hover:text-[#2D6A4F] text-sm transition-colors duration-200"
                    href="/"
                    data-route
                  >
                    Platform Guidelines
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div
          className="border-t"
          style={{ backgroundColor: 'var(--agri-bg-surface)', borderColor: 'var(--agri-border)' }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-center text-center">
            <p className="text-gray-500 text-xs text-center">
              © 2026 AgriNet Lucena. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
