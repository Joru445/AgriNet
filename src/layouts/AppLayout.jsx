import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import BottomTab from "../components/layout/BottomTab";
import OfflineIndicator from "../components/ui/OfflineIndicator";
import PageTransition from "../components/ui/PageTransition";
import { useAuth } from "../context/AuthContext";
import useMediaQuery from "../hooks/useMediaQuery";
import useKeyboardVisible from "../hooks/useKeyboardVisible";

import { tabRoutes } from "../constants/tabsRoutes";

export default function AppLayout() {
  const { identity, authInitializing } = useAuth();
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
   *   last item can scroll above the BottomNavigation).
   * - Pages must NOT re-pad for the Header/BottomNavigation. Product Details'
   *   own fixed MobileActionBar is the one page-level exception.
   *
   * The scroll surface is shared across routes inside this persistent layout,
   * so reset it whenever the pathname changes (search-param changes within a
   * route, e.g. selecting a conversation, intentionally keep position).
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
    <div className="fixed inset-0 flex overflow-hidden h-full">
      {isDesktop && (
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}

      <div
        className={`relative flex-1 h-full overflow-hidden transition-[margin] duration-200 ease-out will-change-[margin] ${
          collapsed ? "lg:ml-20" : "lg:ml-60"
        }`}
      >
        <div
          ref={scrollRef}
          data-app-scroll="true"
          className={`absolute inset-0 isolate overflow-y-auto overscroll-none scrollbar-none bg-(--agri-page) pt-[var(--app-header-h)] ${
            showBottomNav ? "pb-[var(--app-bottom-nav-h)]" : ""
          }`}
        >
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>

        <Header
          user={identity}
          collapsed={collapsed}
          hideBackButton={isTabRoutes}
          authInitializing={authInitializing}
        />
        <OfflineIndicator />

        {showBottomNav && <BottomTab showBottomTab />}
      </div>
    </div>
  );
}
