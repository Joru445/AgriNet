const features = [
  { icon: "ri-shield-check-line", label: "Verified Farmers" },
  { icon: "ri-map-pin-line", label: "Location-Based Discovery" },
  { icon: "ri-message-3-line", label: "Direct Communication" },
  { icon: "ri-star-line", label: "Trusted Reviews" },
];

export default function LandingAbout() {
  return (
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
              {features.map((feature) => (
                <div key={feature.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 flex items-center justify-center bg-[#D8F3DC] rounded-lg">
                    <i className={`${feature.icon} text-[#2D6A4F]`} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
