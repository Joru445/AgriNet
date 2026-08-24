import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BottomTab from "../components/BottomTab";
import { useAuth } from "../context/AuthContext";

import { tabRoutes } from "../constants/tabsRoutes";

export default function AppLayout() {
  const { profile } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);

<<<<<<< HEAD
  const isMessages = location.pathname.includes("messages");
=======
  const location = useLocation();

  const isTabRoutes = tabRoutes.includes(location.pathname);
>>>>>>> 655dc1060d4d11da05a60f611271b836f3c09b96

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`flex-1 flex flex-col h-full overflow-hidden transition-[margin] duration-300 ml-0 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Header user={profile} collapsed={collapsed} hideBackButton={isTabRoutes} />

        <div
          className={`flex-1 min-h-0 overscroll-none ${
            isMessages
              ? "flex flex-col overflow-hidden"
              : "overflow-y-auto"
          }`}
          style={{ backgroundColor: "var(--agri-bg)" }}
        >
          <Outlet />
        </div>

        <BottomTab showBottomTab={isTabRoutes} />
      </div>
    </div>
  );
}
