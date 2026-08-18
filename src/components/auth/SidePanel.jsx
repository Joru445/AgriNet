import { Link } from "react-router-dom";

import logo from "../../assets/favicon.ico";

const STAGES = [
  { label: "Account", icon: "ri-user-line" },
  { label: "Security", icon: "ri-shield-check-line" },
  { label: "Profile", icon: "ri-map-pin-line" },
];

export default function SidePanel({ step = null }) {
  return (
    <div className="hidden lg:flex lg:w-5/12 h-screen bg-[#1B4332] relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#2D6A4F]/30 blur-3xl" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#40916C]/20 blur-3xl" />

      <div className="relative z-10 flex flex-col w-full h-full p-10">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <img src={logo} alt="AgriNet" className="h-9 w-9 object-contain" />
          <span className="text-lg font-bold text-white">AgriNet</span>
          <span className="text-sm text-green-200/70">Lucena</span>
        </Link>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-sm mx-auto">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#F2C265] uppercase mb-3">
              Growing together
            </p>

            <h2 className="text-2xl font-bold text-white leading-tight mb-3">
              Every great harvest starts with a seed.
            </h2>

            <p className="text-sm leading-6 text-green-100/65 mb-6">
              Connect with farmers in Lucena and discover fresh produce directly
              from the source.
            </p>

            <div className="inline-flex items-center gap-2 mb-10 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#74C69D]" />
              <span className="text-xs font-medium text-white/80">
                Supporting local agriculture
              </span>
            </div>

            <div className="flex flex-col gap-7 relative pl-1">
              

              {step && STAGES.map((stage, i) => {
                const stepNumber = i + 1;
                const active = step != null ? step >= stepNumber : true;
                const current = step === stepNumber;

                return (
                  <div
                    key={stage.label}
                    className="flex items-center gap-4 relative"
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors
                        ${active ? "bg-[#95D5B2] text-[#1B4332]" : "bg-white/10 text-white/40"}
                        ${current ? "ring-4 ring-[#F2C265]/30" : ""}`}
                    >
                      <i className={`${stage.icon} text-sm`}></i>
                    </div>

                    <span
                      className={`text-sm font-medium ${active ? "text-white" : "text-white/40"}`}
                    >
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-xs text-green-100/35">© 2026 AgriNet Lucena</p>
      </div>
    </div>
  );
}
