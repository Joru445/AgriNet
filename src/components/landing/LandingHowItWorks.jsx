import { useLanguage } from "../../context/LanguageContext";

export default function LandingHowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      num: "01",
      icon: "ri-user-add-line",
      title: t("landing.howItWorks.step1.title"),
      description: t("landing.howItWorks.step1.description"),
    },
    {
      num: "02",
      icon: "ri-store-2-line",
      title: t("landing.howItWorks.step2.title"),
      description: t("landing.howItWorks.step2.description"),
    },
    {
      num: "03",
      icon: "ri-message-3-line",
      title: t("landing.howItWorks.step3.title"),
      description: t("landing.howItWorks.step3.description"),
    },
    {
      num: "04",
      icon: "ri-shake-hands-line",
      title: t("landing.howItWorks.step4.title"),
      description: t("landing.howItWorks.step4.description"),
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#1B4332]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-green-300 font-semibold text-sm uppercase tracking-widest mb-3">
            {t("landing.howItWorks.badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">{t("landing.howItWorks.title")}</h2>
          <p className="text-green-200/80 mt-3 max-w-xl mx-auto">
            {t("landing.howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={step.num} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] right-[-calc(50%-40px)] h-px border-t-2 border-dashed border-green-600 z-0" />
              )}
              <div className="relative z-10 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-200">
                <div className="w-16 h-16 flex items-center justify-center bg-[#2D6A4F] rounded-full mx-auto mb-4">
                  <i className={`${step.icon} text-white text-2xl`} />
                </div>
                <span className="text-green-300 font-bold text-xs tracking-widest">
                  {step.num}
                </span>
                <h3 className="text-white font-bold text-lg mt-1 mb-2">{step.title}</h3>
                <p className="text-green-200/75 text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
