const CONTAINER_VARIANTS = {
  standard: "max-w-7xl",
  narrow: "max-w-3xl",
  wide: "max-w-[1400px]",
  full: "w-full",
};

export default function PageWrapper({
  children,
  className = "",
  containerClassName = "",
  variant = "standard",
}) {
  const maxWidth = CONTAINER_VARIANTS[variant] || CONTAINER_VARIANTS.standard;

  return (
    <main className={`min-h-full bg-(--agri-page) px-3 py-4 sm:px-6 sm:py-6 lg:px-8 ${className}`}>
      <div className={`mx-auto ${maxWidth} ${containerClassName}`}>
        {children}
      </div>
    </main>
  );
}

