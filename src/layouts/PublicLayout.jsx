import { Outlet } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";

export default function PublicLayout() {
  return (
    <main className="min-h-screen bg-agri-bg">
      <PageTransition>
        <Outlet />
      </PageTransition>
    </main>
  );
}
