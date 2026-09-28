/**
 * Reusable wrapper for marketplace discovery sections (Near You,
 * Recently Added, Recommended, All Products).
 *
 * Renders a section heading + subtitle + children grid.
 */
export default function DiscoverySection({
  title,
  subtitle,
  alignItems = "items-end",
  children,
}) {
  return (
    <section className="space-y-4">
      <div className={`flex ${alignItems} justify-between gap-4`}>
        <div>
          <h2 className="text-lg sm:text-xl font-black text-[#1B4332] dark:text-(--agri-text)">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-xs sm:text-sm text-(--agri-text-muted)">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}
