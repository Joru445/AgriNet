export default function PageWrapper({ children, className = "" }) {
  return (
    <main className={`min-h-full bg-(--agri-page) dark:bg-(--agri-page) px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </main>
  );
}
