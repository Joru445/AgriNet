import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import BottomTab from "../components/BottomTab";

import { useAuth } from "../context/AuthContext";

export default function FarmerLayout() {
  const { profile } = useAuth();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}/>

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ml-0 ${collapsed ? "lg:ml-20" : "lg:ml-64"}`}>
        <Header user={profile} />

        <div className="bg-[#FAFAFA] flex-1 overflow-y-auto">
          <Outlet />
        </div>

        <BottomTab />
      </div>
    </>
  );
}
