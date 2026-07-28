import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
        ${isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"}
      `}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
          <a className="flex items-center gap-2 cursor-pointer" href="/">
            <img
              alt="AgriNet Lucena Logo"
              className="h-10 w-10 object-contain"
              src="public/favicon.svg"
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
            className="md:hidden w-10 h-10 flex items-center justify-center text-white focus:outline-none cursor-pointer"
            aria-label="Open menu"
            onClick={() => setIsDrawerOpen(true)}
          >
            <i className="text-2xl ri-menu-line"></i>
          </button>
        </div>
      </header>

      <div
        className={`
        md:hidden fixed bg-black/5 backdrop-blur-sm z-9998 inset-0 transition-all ease-in-out duration-300
        ${isDrawerOpen ? "opacity-full pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
      ></div>

      <div
        className={`
        md:hidden fixed flex flex-col justify-between p-5 top-0 right-0 w-[70%] max-width:[260px] h-screen bg-[#1B4332] text-white z-9999 shadow-sm transition-all ease-in-out duration-300
        ${isDrawerOpen ? "visible translate-x-0" : "invisible translate-x-full"}
      `}
      >
        <div>
          <div className="flex items-center justify-end border-b border-white/10 pb-4 mb-5">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white focus:outline-none cursor-pointer"
              aria-label="Close menu"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <nav className="flex flex-col gap-3">
            <a
              href="#about"
              className="mobile-drawer-link text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-3 whitespace-nowrap"
            >
              <i className="ri-information-line text-green-300 text-lg"></i>{" "}
              About
            </a>
            <a
              href="#how-it-works"
              className="mobile-drawer-link text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-3 whitespace-nowrap"
            >
              <i className="ri-settings-4-line text-green-300 text-lg"></i> How
              It Works
            </a>
            <a
              href="#for-farmers"
              className="mobile-drawer-link text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-3 whitespace-nowrap"
            >
              <i className="ri-plant-line text-green-300 text-lg"></i> For
              Farmers
            </a>
            <a
              href="#for-consumers"
              className="mobile-drawer-link text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-3 whitespace-nowrap"
            >
              <i className="ri-shopping-basket-line text-green-300 text-lg"></i>{" "}
              For Consumers
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-3 pt-5 border-t border-white/10">
          <Link
            className="mobile-drawer-link w-full text-center px-5 py-2.5 rounded-full text-xs font-semibold border-2 border-gray-300 text-gray-200 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 whitespace-nowrap"
            to="/login"
          >
            Login
          </Link>
          <Link
            className="mobile-drawer-link w-full text-center px-5 py-2.5 rounded-full text-xs font-semibold bg-[#2D6A4F] text-white hover:bg-[#1B4332] transition-all duration-200 whitespace-nowrap"
            to="/register"
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
            src="src/assets/img/landscape.jpg"
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
              AgriNet Lucena eliminates middlemen, giving farm ers fair prices
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
          <div className="absolute bottom-12 right-8 hidden lg:flex flex-col gap-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-[#D8F3DC] rounded-full">
                <i className="ri-user-line text-[#2D6A4F]"></i>
              </div>
              <div>
                <p className="text-xl font-bold text-[#1B4332]">500+</p>
                <p className="text-xs text-gray-500">Active Farmers</p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-[#D8F3DC] rounded-full">
                <i className="ri-shopping-basket-line text-[#2D6A4F]"></i>
              </div>
              <div>
                <p className="text-xl font-bold text-[#1B4332]">2,000+</p>
                <p className="text-xs text-gray-500">Products Listed</p>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3 flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-[#D8F3DC] rounded-full">
                <i className="ri-star-line text-[#2D6A4F]"></i>
              </div>
              <div>
                <p className="text-xl font-bold text-[#1B4332]">4.8/5</p>
                <p className="text-xs text-gray-500">Average Rating</p>
              </div>
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

      <section id="for-farmers" className="py-20 md:py-28 bg-[#F8FAF9]">
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
            <div className="bg-white rounded-2xl p-8">
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
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="inline-block text-[#2D6A4F] font-semibold text-sm uppercase tracking-widest mb-2">
                Fresh From the Farm
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1B4332]">
                Featured Products
              </h2>
            </div>
            <a
              className="inline-flex items-center gap-2 text-[#2D6A4F] font-semibold text-sm hover:underline whitespace-nowrap"
              href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/consumer/dashboard"
              data-discover="true"
            >
              View All Products <i className="ri-arrow-right-line"></i>
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#2D6A4F]/30 transition-all duration-200 group">
              <div className="relative h-48 overflow-hidden">
                <img
                  alt="Fresh Organic Tomatoes"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  src="https://readdy.ai/api/search-image?query=fresh%20red%20organic%20tomatoes%20on%20a%20clean%20white%20background%2C%20vibrant%20colors%2C%20professional%20food%20photography%2C%20natural%20lighting%2C%20farm%20fresh%20produce%2C%20high%20quality&amp;width=400&amp;height=400&amp;seq=prod1&amp;orientation=squarish"
                />
                <span className="absolute top-3 left-3 bg-[#2D6A4F] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Vegetables
                </span>
                <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Available
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
                  Fresh Organic Tomatoes
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-[#2D6A4F]">
                    ₱45
                    <span className="text-sm font-normal text-gray-400">
                      /kg
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">150 kg left</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Juan dela Cruz
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <i className="ri-map-pin-line"></i>Brgy. Ibabang Dupay,
                        Lucena
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <span className="text-xs text-gray-500 ml-1">4.8</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    className="flex-1 text-center py-2 rounded-lg border-2 border-[#2D6A4F] text-[#2D6A4F] text-sm font-semibold hover:bg-[#2D6A4F] hover:text-white transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/products/1"
                    data-discover="true"
                  >
                    View Details
                  </a>
                  <a
                    className="flex-1 text-center py-2 rounded-lg bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#1B4332] transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/login"
                    data-discover="true"
                  >
                    Send Inquiry
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#2D6A4F]/30 transition-all duration-200 group">
              <div className="relative h-48 overflow-hidden">
                <img
                  alt="Sweet Lakatan Bananas"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  src="https://readdy.ai/api/search-image?query=fresh%20yellow%20lakatan%20bananas%20bunch%20on%20white%20background%2C%20vibrant%20tropical%20fruit%2C%20professional%20food%20photography%2C%20natural%20lighting%2C%20farm%20fresh&amp;width=400&amp;height=400&amp;seq=prod2&amp;orientation=squarish"
                />
                <span className="absolute top-3 left-3 bg-[#2D6A4F] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Fruits
                </span>
                <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Available
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
                  Sweet Lakatan Bananas
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-[#2D6A4F]">
                    ₱30
                    <span className="text-sm font-normal text-gray-400">
                      /kg
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">200 kg left</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Maria Santos
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <i className="ri-map-pin-line"></i>Brgy. Gulang-Gulang,
                        Lucena
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <span className="text-xs text-gray-500 ml-1">4.6</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    className="flex-1 text-center py-2 rounded-lg border-2 border-[#2D6A4F] text-[#2D6A4F] text-sm font-semibold hover:bg-[#2D6A4F] hover:text-white transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/products/2"
                    data-discover="true"
                  >
                    View Details
                  </a>
                  <a
                    className="flex-1 text-center py-2 rounded-lg bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#1B4332] transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/login"
                    data-discover="true"
                  >
                    Send Inquiry
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#2D6A4F]/30 transition-all duration-200 group">
              <div className="relative h-48 overflow-hidden">
                <img
                  alt="White Corn (Mais)"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  src="https://readdy.ai/api/search-image?query=fresh%20white%20corn%20maize%20on%20clean%20white%20background%2C%20professional%20food%20photography%2C%20natural%20lighting%2C%20farm%20fresh%20produce%2C%20vibrant%20colors&amp;width=400&amp;height=400&amp;seq=prod3&amp;orientation=squarish"
                />
                <span className="absolute top-3 left-3 bg-[#2D6A4F] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Grains
                </span>
                <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Available
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
                  White Corn (Mais)
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-[#2D6A4F]">
                    ₱25
                    <span className="text-sm font-normal text-gray-400">
                      /kg
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">300 kg left</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Pedro Reyes
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <i className="ri-map-pin-line"></i>Brgy. Cotta, Lucena
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <span className="text-xs text-gray-500 ml-1">4.9</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    className="flex-1 text-center py-2 rounded-lg border-2 border-[#2D6A4F] text-[#2D6A4F] text-sm font-semibold hover:bg-[#2D6A4F] hover:text-white transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/products/3"
                    data-discover="true"
                  >
                    View Details
                  </a>
                  <a
                    className="flex-1 text-center py-2 rounded-lg bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#1B4332] transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/login"
                    data-discover="true"
                  >
                    Send Inquiry
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#2D6A4F]/30 transition-all duration-200 group">
              <div className="relative h-48 overflow-hidden">
                <img
                  alt="Pechay (Bok Choy)"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  src="https://readdy.ai/api/search-image?query=fresh%20green%20pechay%20bok%20choy%20vegetables%20on%20white%20background%2C%20vibrant%20green%20leaves%2C%20professional%20food%20photography%2C%20natural%20lighting%2C%20farm%20fresh&amp;width=400&amp;height=400&amp;seq=prod4&amp;orientation=squarish"
                />
                <span className="absolute top-3 left-3 bg-[#2D6A4F] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Vegetables
                </span>
                <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Available
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
                  Pechay (Bok Choy)
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-[#2D6A4F]">
                    ₱20
                    <span className="text-sm font-normal text-gray-400">
                      /bundle
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">80 bundle left</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Juan dela Cruz
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <i className="ri-map-pin-line"></i>Brgy. Ibabang Dupay,
                        Lucena
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <span className="text-xs text-gray-500 ml-1">4.7</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    className="flex-1 text-center py-2 rounded-lg border-2 border-[#2D6A4F] text-[#2D6A4F] text-sm font-semibold hover:bg-[#2D6A4F] hover:text-white transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/products/4"
                    data-discover="true"
                  >
                    View Details
                  </a>
                  <a
                    className="flex-1 text-center py-2 rounded-lg bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#1B4332] transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/login"
                    data-discover="true"
                  >
                    Send Inquiry
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#2D6A4F]/30 transition-all duration-200 group">
              <div className="relative h-48 overflow-hidden">
                <img
                  alt="Carabao Mango"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  src="https://readdy.ai/api/search-image?query=fresh%20yellow%20carabao%20mangoes%20on%20white%20background%2C%20tropical%20fruit%2C%20professional%20food%20photography%2C%20natural%20lighting%2C%20Philippine%20mangoes%2C%20vibrant&amp;width=400&amp;height=400&amp;seq=prod5&amp;orientation=squarish"
                />
                <span className="absolute top-3 left-3 bg-[#2D6A4F] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Fruits
                </span>
                <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Available
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
                  Carabao Mango
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-[#2D6A4F]">
                    ₱80
                    <span className="text-sm font-normal text-gray-400">
                      /kg
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">120 kg left</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Rosa Mendoza
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <i className="ri-map-pin-line"></i>Brgy. Dalahican,
                        Lucena
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <span className="text-xs text-gray-500 ml-1">5</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    className="flex-1 text-center py-2 rounded-lg border-2 border-[#2D6A4F] text-[#2D6A4F] text-sm font-semibold hover:bg-[#2D6A4F] hover:text-white transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/products/5"
                    data-discover="true"
                  >
                    View Details
                  </a>
                  <a
                    className="flex-1 text-center py-2 rounded-lg bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#1B4332] transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/login"
                    data-discover="true"
                  >
                    Send Inquiry
                  </a>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-[#2D6A4F]/30 transition-all duration-200 group">
              <div className="relative h-48 overflow-hidden">
                <img
                  alt="Eggplant (Talong)"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  src="https://readdy.ai/api/search-image?query=fresh%20purple%20eggplant%20talong%20on%20white%20background%2C%20vibrant%20vegetable%2C%20professional%20food%20photography%2C%20natural%20lighting%2C%20farm%20fresh%20produce&amp;width=400&amp;height=400&amp;seq=prod6&amp;orientation=squarish"
                />
                <span className="absolute top-3 left-3 bg-[#2D6A4F] text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Vegetables
                </span>
                <span className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  Available
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">
                  Eggplant (Talong)
                </h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-[#2D6A4F]">
                    ₱35
                    <span className="text-sm font-normal text-gray-400">
                      /kg
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">60 kg left</span>
                </div>
                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Maria Santos
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <i className="ri-map-pin-line"></i>Brgy. Gulang-Gulang,
                        Lucena
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <i className="text-xs ri-star-fill text-amber-400"></i>
                      <span className="text-xs text-gray-500 ml-1">4.5</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a
                    className="flex-1 text-center py-2 rounded-lg border-2 border-[#2D6A4F] text-[#2D6A4F] text-sm font-semibold hover:bg-[#2D6A4F] hover:text-white transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/products/6"
                    data-discover="true"
                  >
                    View Details
                  </a>
                  <a
                    className="flex-1 text-center py-2 rounded-lg bg-[#2D6A4F] text-white text-sm font-semibold hover:bg-[#1B4332] transition-all duration-200 whitespace-nowrap"
                    href="/preview/aafb836f-663b-4dda-ab3e-b6a320b0eb8c/8772535/login"
                    data-discover="true"
                  >
                    Send Inquiry
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#1B4332] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 flex justify-center">
          <div className="flex flex-col md:flex-row items-start justify-center gap-10 md:gap-16 lg:gap-24 w-full max-w-5xl">
            <div className="text-left flex-1 min-w-[220px] max-w-[280px]">
              <div className="flex items-center gap-2 mb-4">
                <img
                  alt="AgriNet Logo"
                  className="h-10 w-10 object-contain"
                  src="./src/assets/img/logo.png"
                />
                <span className="font-bold text-lg">
                  AgriNet <span className="font-light">Lucena</span>
                </span>
              </div>
              <p className="text-green-200/75 text-sm leading-relaxed mb-5">
                Connecting farmers and consumers in Lucena City for a fairer,
                fresher, and more sustainable agricultural trade.
              </p>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-[#2D6A4F] rounded-full transition-colors duration-200"
                >
                  <i className="ri-facebook-fill text-sm"></i>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-[#2D6A4F] rounded-full transition-colors duration-200"
                >
                  <i className="ri-twitter-fill text-sm"></i>
                </a>
                <a
                  href="#"
                  className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-[#2D6A4F] rounded-full transition-colors duration-200"
                >
                  <i className="ri-instagram-line text-sm"></i>
                </a>
              </div>
            </div>
            <div className="text-left flex-1 min-w-[180px] max-w-[240px]">
              <h4 className="font-bold text-sm uppercase tracking-widest text-green-300 mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#about"
                    className="text-green-200/75 hover:text-white text-sm transition-colors duration-200"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-green-200/75 hover:text-white text-sm transition-colors duration-200"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="/consumer/dashboard"
                    className="text-green-200/75 hover:text-white text-sm transition-colors duration-200"
                  >
                    Browse Products
                  </a>
                </li>
                <li>
                  <a
                    href="/farmers/nearby"
                    className="text-green-200/75 hover:text-white text-sm transition-colors duration-200"
                  >
                    Find Farmers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-green-200/75 hover:text-white text-sm transition-colors duration-200"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
            <div className="text-left flex-1 min-w-[180px] max-w-[240px]">
              <h4 className="font-bold text-sm uppercase tracking-widest text-green-300 mb-4">
                For Users
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    className="text-green-200/75 hover:text-white text-sm transition-colors duration-200"
                    href="/register"
                    data-route
                  >
                    Farmer Registration
                  </a>
                </li>
                <li>
                  <a
                    className="text-green-200/75 hover:text-white text-sm transition-colors duration-200"
                    href="/register"
                    data-route
                  >
                    Consumer Registration
                  </a>
                </li>
                <li>
                  <a
                    className="text-green-200/75 hover:text-white text-sm transition-colors duration-200"
                    href="/login"
                    data-route
                  >
                    Farmer Dashboard
                  </a>
                </li>
                <li>
                  <a
                    className="text-green-200/75 hover:text-white text-sm transition-colors duration-200"
                    href="/login"
                    data-route
                  >
                    Consumer Dashboard
                  </a>
                </li>
                <li>
                  <a
                    className="text-green-200/75 hover:text-white text-sm transition-colors duration-200"
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
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-center text-center">
            <p className="text-green-200/60 text-xs text-center">
              © 2026 AgriNet Lucena. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
