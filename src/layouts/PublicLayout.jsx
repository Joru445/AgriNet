import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--agri-bg)' }}>
      <Outlet />
    </main>
  );
}
