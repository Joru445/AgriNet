const farmerBenefits = [
  {
    icon: "ri-money-dollar-circle-line",
    title: "Fair Pricing",
    description: "Set your own prices and earn more without middlemen taking a cut.",
  },
  {
    icon: "ri-store-2-line",
    title: "Wider Market Reach",
    description: "Reach consumers across Lucena City directly through our platform.",
  },
  {
    icon: "ri-bar-chart-line",
    title: "Manage Listings Easily",
    description: "Add, update, and manage your product listings with a simple dashboard.",
  },
  {
    icon: "ri-message-3-line",
    title: "Direct Communication",
    description: "Chat directly with consumers and respond to inquiries in real time.",
  },
];

const consumerBenefits = [
  {
    icon: "ri-leaf-line",
    title: "Fresh Local Produce",
    description: "Buy directly from farmers and get the freshest products available.",
  },
  {
    icon: "ri-price-tag-3-line",
    title: "Better Prices",
    description: "No middlemen means lower prices for consumers on quality produce.",
  },
  {
    icon: "ri-map-pin-line",
    title: "Find Nearby Farmers",
    description: "Discover farmers closest to your location for convenient sourcing.",
  },
  {
    icon: "ri-star-line",
    title: "Trusted Reviews",
    description: "Read verified reviews from other consumers before making inquiries.",
  },
];

function BenefitItem({ icon, title, description, dark }) {
  return (
    <div className="flex gap-4 items-start">
      <div
        className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5 ${
          dark ? "bg-white/15" : "bg-[#D8F3DC]"
        }`}
      >
        <i
          className={`${icon} text-sm ${
            dark ? "text-green-300" : "text-[#2D6A4F]"
          }`}
        />
      </div>
      <div>
        <p className={`font-semibold text-sm ${dark ? "text-white" : "text-gray-800"}`}>
          {title}
        </p>
        <p className={`text-sm mt-0.5 ${dark ? "text-green-200/80" : "text-gray-500"}`}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default function LandingBenefits() {
  return (
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
          {/* Farmers */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 flex items-center justify-center bg-[#1B4332] rounded-xl">
                <i className="ri-plant-line text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1B4332]">For Farmers</h3>
                <p className="text-sm text-gray-500">Grow your business directly</p>
              </div>
            </div>
            <div className="space-y-4">
              {farmerBenefits.map((b) => (
                <BenefitItem key={b.title} {...b} />
              ))}
            </div>
          </div>

          {/* Consumers */}
          <div id="for-consumers" className="bg-[#1B4332] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-xl">
                <i className="ri-shopping-basket-line text-white text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">For Consumers</h3>
                <p className="text-sm text-green-300">Fresh produce at your fingertips</p>
              </div>
            </div>
            <div className="space-y-4">
              {consumerBenefits.map((b) => (
                <BenefitItem key={b.title} {...b} dark />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
