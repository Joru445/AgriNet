import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import logo from "../../assets/favicon.svg";

export default function LandingHeader() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#how-it-works", label: "How It Works" },
    { href: "#for-farmers", label: "For Farmers" },
    { href: "#for-consumers", label: "For Consumers" },
  ];

  const drawerLinks = [
    { href: "#about", label: "About", icon: "ri-information-line" },
    { href: "#how-it-works", label: "How It Works", icon: "ri-settings-4-line" },
    { href: "#for-farmers", label: "For Farmers", icon: "ri-plant-line" },
    { href: "#for-consumers", label: "For Consumers", icon: "ri-shopping-basket-line" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/70 backdrop-blur-md shadow-xs border-b border-black/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
          <a className="flex items-center gap-2 cursor-pointer" href="/">
            <img alt="AgriNet Lucena Logo" className="h-10 w-10 object-contain" src={logo} />
            <span
              className={`font-bold text-lg whitespace-nowrap transition-colors duration-300 ${
                isScrolled ? "text-gray-800" : "text-white"
              }`}
            >
              AgriNet <span className="font-light">Lucena</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 hover:text-[#2D6A4F] whitespace-nowrap ${
                  isScrolled ? "text-gray-800" : "text-white/90"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              className={`px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 whitespace-nowrap hover:text-gray-900 ${
                isScrolled
                  ? "border-gray-400 text-gray-600 hover:bg-gray-400"
                  : "border-gray-300 text-gray-300 hover:bg-gray-300"
              }`}
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
            className={`md:hidden w-10 h-10 flex items-center justify-center focus:outline-none cursor-pointer transition-colors duration-200 ${
              isScrolled ? "text-gray-800 hover:text-[#2D6A4F]" : "text-white hover:text-green-200"
            }`}
            aria-label="Open menu"
            onClick={() => setIsDrawerOpen(true)}
          >
            <i className="text-2xl ri-menu-line" />
          </button>
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        className={`md:hidden fixed bg-black/40 backdrop-blur-xs z-[9998] inset-0 transition-all ease-in-out duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed flex flex-col justify-between p-4 sm:p-5 top-0 right-0 w-[78%] max-w-[280px] h-[100dvh] max-h-screen bg-[#1B4332] text-white z-[9999] shadow-2xl transition-all ease-in-out duration-300 overflow-y-auto ${
          isDrawerOpen ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-end border-b border-white/10 pb-3 mb-3">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white focus:outline-none cursor-pointer rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close menu"
            >
              <i className="ri-close-line text-2xl" />
            </button>
          </div>

          <nav className="flex flex-col gap-1.5 sm:gap-2 overflow-y-auto">
            {drawerLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsDrawerOpen(false)}
                className="text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-3 whitespace-nowrap"
              >
                <i className={`${link.icon} text-green-300 text-lg`} /> {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="shrink-0 flex flex-col gap-2.5 pt-3 mt-2 border-t border-white/10">
          <Link
            className="w-full text-center px-4 py-2.5 rounded-full text-xs font-semibold border-2 border-gray-300 text-gray-200 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 whitespace-nowrap"
            to="/login"
            onClick={() => setIsDrawerOpen(false)}
          >
            Login
          </Link>
          <Link
            className="w-full text-center px-4 py-2.5 rounded-full text-xs font-semibold bg-[#2D6A4F] text-white hover:bg-[#1B4332] transition-all duration-200 whitespace-nowrap shadow-sm"
            to="/register"
            onClick={() => setIsDrawerOpen(false)}
          >
            Register
          </Link>
        </div>
      </div>
    </>
  );
}
