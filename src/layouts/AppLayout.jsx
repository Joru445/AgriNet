import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BottomTab from "../components/BottomTab";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div
        className={`flex-1 flex flex-col h-screen h-[100dvh] max-h-[100dvh] overflow-hidden transition-all duration-300 ml-0 ${
          collapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <Header user={profile} collapsed={collapsed} />

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-none" style={{ backgroundColor: 'var(--agri-bg)' }}>
          <Outlet />
        </div>

        <BottomTab />
      </div>
    </>
  );
}
