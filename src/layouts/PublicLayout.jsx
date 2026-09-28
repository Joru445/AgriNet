import { Outlet } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";

export default function PublicLayout() {
  return (
    <main data-theme="light" className="min-h-screen bg-[#f7faf8] text-[#132319]">
      <PageTransition>
        <Outlet />
      </PageTransition>
    </main>
  );
}

