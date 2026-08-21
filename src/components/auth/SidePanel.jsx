import { Link } from "react-router-dom";

import logo from "../../assets/favicon.ico";
import landscapeBg from "../../assets/img/landscape.jpg";

const STAGES = [
  { label: "Account", icon: "ri-user-line" },
  { label: "Security", icon: "ri-shield-check-line" },
  { label: "Profile", icon: "ri-map-pin-line" },
];

export default function SidePanel({ step = null }) {
  return (
    <div className="hidden lg:flex lg:w-5/12 h-screen relative overflow-hidden">
      {/* Background image */}
      <img
        src={landscapeBg}
        alt="Agricultural landscape"
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Dark gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e1a]/90 via-[#1B4332]/80 to-[#2D6A4F]/60" />

      {/* Subtle top-left decorative glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#40916C]/25 blur-3xl pointer-events-none" />
      {/* Bottom-right accent glow */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-[#F2C265]/10 blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col w-full h-full p-10">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 w-fit group">
          <img src={logo} alt="AgriNet" className="h-9 w-9 object-contain drop-shadow-lg" />
          <span className="text-lg font-bold text-white drop-shadow">
            AgriNet <span className="font-light text-green-100/90">Lucena</span>
          </span>
        </Link>

        {/* Main content */}
        <div className="flex-1 flex items-center">
          <div className="w-full max-w-sm mx-auto">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#74C69D] animate-pulse" />
              <span className="text-xs font-medium text-green-100/90 tracking-wide">
                Supporting local agriculture
              </span>
            </div>

            <p className="text-xs font-semibold tracking-[0.2em] text-[#F2C265] uppercase mb-3 drop-shadow">
              Growing together
            </p>

            <h2 className="text-3xl font-bold text-white leading-tight mb-4 drop-shadow-md">
              Every great harvest<br />starts with a seed.
            </h2>

            <p className="text-sm leading-6 text-green-100/75 mb-8">
              Connect with farmers in Lucena and discover fresh produce directly
              from the source. Join a thriving community built on trust and sustainability.
            </p>



            {/* Register step indicators */}
            {step && (
              <div className="flex flex-col gap-5 relative pl-1 mb-6">
                {STAGES.map((stage, i) => {
                  const stepNumber = i + 1;
                  const active = step != null ? step >= stepNumber : true;
                  const current = step === stepNumber;

                  return (
                    <div key={stage.label} className="flex items-center gap-4 relative">
                      {/* connector line */}
                      {i < STAGES.length - 1 && (
                        <div
                          className={`absolute left-4 top-8 w-px h-5 -translate-x-1/2 ${
                            step > stepNumber ? "bg-[#95D5B2]/60" : "bg-white/15"
                          }`}
                        />
                      )}

                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                          ${active ? "bg-[#95D5B2] text-[#1B4332] shadow-lg shadow-[#95D5B2]/30" : "bg-white/10 text-white/40"}
                          ${current ? "ring-4 ring-[#F2C265]/40 scale-110" : ""}`}
                      >
                        <i className={`${stage.icon} text-sm`}></i>
                      </div>

                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${active ? "text-white" : "text-white/40"}`}>
                          {stage.label}
                        </span>
                        {current && (
                          <span className="text-[10px] text-[#F2C265]/80">Current step</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-green-100/35">© 2026 AgriNet Lucena</p>
          <div className="flex items-center gap-1.5">
            <i className="ri-leaf-line text-[#74C69D]/50 text-sm" />
            <span className="text-[10px] text-green-100/30">Farm to Table</span>
          </div>
        </div>
      </div>
    </div>
  );
}
