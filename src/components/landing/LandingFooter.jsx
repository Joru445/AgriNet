import { useLanguage } from "../../context/LanguageContext";

import logo from "../../assets/favicon.svg";

const socialLinks = [
  { icon: "ri-facebook-fill", href: "#" },
  { icon: "ri-twitter-fill", href: "#" },
  { icon: "ri-instagram-line", href: "#" },
];

export default function LandingFooter() {
  const { t } = useLanguage();

  const quickLinks = [
    { href: "#about", label: t("landing.footer.aboutUs") },
    { href: "#how-it-works", label: t("landing.nav.howItWorks") },
    { href: "/consumer/dashboard", label: t("landing.footer.browseProducts") },
    { href: "/farmers/nearby", label: t("landing.footer.findFarmers") },
    { href: "#", label: t("landing.footer.contactUs") },
  ];

  const userLinks = [
    { href: "/register", label: t("landing.footer.registration") },
    { href: "/login", label: t("landing.footer.dashboard") },
    { href: "/", label: t("landing.footer.platformGuidelines") },
  ];

  return (
    <footer
      className="border-t text-gray-800"
      style={{ backgroundColor: "var(--agri-bg)", borderColor: "var(--agri-border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 flex justify-center">
        <div className="flex flex-col md:flex-row items-start justify-center gap-10 md:gap-16 lg:gap-24 w-full max-w-5xl">
          {/* Brand */}
          <div className="text-left flex-1 min-w-[220px] max-w-[280px]">
            <div className="flex items-center gap-2 mb-4">
              <img alt="AgriNet Logo" className="h-10 w-10 object-contain" src={logo} />
              <span className="font-bold text-lg text-[#1B4332]">
                AgriNet <span className="font-light">Lucena</span>
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              {t("landing.footer.description")}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  className="w-9 h-9 flex items-center justify-center bg-white border border-[#d4e8da] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white rounded-full transition-colors duration-200 shadow-xs"
                >
                  <i className={`${social.icon} text-sm`} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-left flex-1 min-w-[180px] max-w-[240px]">
            <h4 className="font-bold text-sm uppercase tracking-widest text-[#1B4332] mb-4">
              {t("landing.footer.quickLinks")}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-[#2D6A4F] text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* For Users */}
          <div className="text-left flex-1 min-w-[180px] max-w-[240px]">
            <h4 className="font-bold text-sm uppercase tracking-widest text-[#1B4332] mb-4">
              {t("landing.footer.forUsers")}
            </h4>
            <ul className="space-y-2">
              {userLinks.map((link) => (
                <li key={link.label}>
                  <a
                    className="text-gray-600 hover:text-[#2D6A4F] text-sm transition-colors duration-200"
                    href={link.href}
                    data-route
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div
        className="border-t"
        style={{ backgroundColor: "var(--agri-bg-surface)", borderColor: "var(--agri-border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex items-center justify-center text-center">
          <p className="text-gray-500 text-xs text-center">
            &copy; 2026 AgriNet Lucena. {t("landing.footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
