import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import BottomTab from "../components/layout/BottomTab";
import OfflineIndicator from "../components/ui/OfflineIndicator";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import useMediaQuery from "../hooks/useMediaQuery";
import useKeyboardVisible from "../hooks/useKeyboardVisible";

import { tabRoutes } from "../constants/tabsRoutes";

export default function AppLayout() {
  const { identity, authInitializing } = useAuth();
  const { resolved } = useTheme();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [collapsed, setCollapsed] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isKeyboardVisible = useKeyboardVisible();
  const scrollRef = useRef(null);

  /*
   * Edge-to-edge shell contract:
   * - The scroll surface (`scrollRef`) fills the entire content region.
   * - Header and BottomNavigation are absolutely positioned OVERLAYS; they
   *   never reduce the physical height of the scroll surface.
   * - Global navigation insets are padding on the scroll surface itself, so
   *   they scroll away with the content (first item starts below the Header,
   *   last item can scroll completely above the BottomNavigation).
   * - On desktop (lg), mobile bottom navigation is hidden and receives no extra pb.
   */
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  const isTabRoutes = tabRoutes.includes(location.pathname);

  const isMessagesRoute = location.pathname.includes("messages");
  const hasActiveChat =
    isMessagesRoute &&
    Boolean(searchParams.get("conversation") || searchParams.get("user"));

  const showBottomNav =
    isTabRoutes && !isDesktop && !isKeyboardVisible && !hasActiveChat;

  return (
    <div data-theme={resolved} className="fixed inset-0 flex overflow-hidden h-full">
      {isDesktop && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      <div
        className={`flex-1 flex flex-col h-full overflow-hidden transition-[margin] duration-200 ease-out will-change-[margin] ${
          collapsed ? "lg:ml-20" : "lg:ml-60"
        }`}
      >
        <Header
          user={identity}
          collapsed={collapsed}
          hideBackButton={isTabRoutes}
          authInitializing={authInitializing}
        />
        <OfflineIndicator />

        <div
          ref={scrollRef}
          data-app-scroll="true"
          className={`flex-1 min-h-0 min-w-0 w-full bg-(--agri-page) ${
            isMessagesRoute
              ? "h-full overflow-hidden flex flex-col"
              : "overflow-y-auto overflow-x-hidden overscroll-none scrollbar-none"
          }`}
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>

        {showBottomNav && <BottomTab showBottomTab />}
      </div>
    </div>
  );
}

