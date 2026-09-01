import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--agri-page)] px-4">
      <div className="text-center">
        <p className="text-7xl font-bold text-[#2D6A4F] dark:text-[var(--agri-brand)]">404</p>

        <h1 className="mt-4 text-2xl font-bold text-[var(--agri-text)]">
          Page not found
        </h1>

        <p className="mt-2 text-[var(--agri-text-muted)]">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-xl bg-[#2D6A4F] px-5 py-3 font-medium text-white transition hover:bg-[#1B4332]"
        >
          Go back home
        </Link>
      </div>
    </main>
  );
}
