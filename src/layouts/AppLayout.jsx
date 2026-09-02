import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BottomTab from "../components/BottomTab";
import OfflineIndicator from "../components/common/OfflineIndicator";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../context/AuthContext";
import useMediaQuery from "../hooks/useMediaQuery";

import { tabRoutes } from "../constants/tabsRoutes";

export default function AppLayout() {
  const { profile } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const isMessages = location.pathname.includes("messages");
  const isTabRoutes = tabRoutes.includes(location.pathname);

  return (
    <div className="fixed inset-0 flex overflow-hidden h-full dark:lg:p-2">
      {isDesktop && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      <div
        className={`flex-1 flex flex-col h-full overflow-hidden transition-[margin] duration-300 dark:lg:px-2 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Header user={profile} collapsed={collapsed} hideBackButton={isTabRoutes} />
        <OfflineIndicator />

        <div
          className={`flex-1 min-h-0 overscroll-none scrollbar-none bg-(--agri-page) ${
            isMessages
              ? "flex flex-col overflow-hidden"
              : "overflow-y-auto"
          }`}
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>

        {!isDesktop && <BottomTab showBottomTab={isTabRoutes} />}
      </div>
    </div>
  );
}