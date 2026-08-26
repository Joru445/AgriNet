import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { navigationByRole } from "../constants/navigation";
import { showToast } from "../utils/toast";

import logo from "../assets/favicon.ico";
import UserIdentity from "./common/UserIdentity";
import LogoutConfirmModal from "./common/LogoutConfirmModal";

import { useUnreadMessages } from "../context/UnreadMessagesContext";
import { useUnreadInquiries } from "../context/UnreadInquiriesContext";
import { useUnreadReports } from "../context/UnreadReportsContext";

export default function Sidebar({ collapsed, setCollapsed }) {
  const { profile, logout } = useAuth();
  const { unreadCount, showPopup } = useUnreadMessages();
  const { inquiryActionCount, showInquiryPopup, inquiryPopupMessage } = useUnreadInquiries();
  const { pendingReportsCount, showReportPopup, reportPopupMessage } = useUnreadReports();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logout();

      showToast.success("Logged out.");
      setShowLogoutModal(false);
      navigate("/login");
    } catch (error) {
      console.error(error);
      showToast.error(error.message);
    } finally {
      setLoggingOut(false);
    }
  }

  const items = navigationByRole[profile?.role] ?? [];

  return (
    <aside
      className={`hidden lg:flex fixed top-0 left-0 h-full bg-agri-dark flex-col z-9996 transition-all duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Logo */}

      <div className="flex h-16 shrink-0 items-center gap-3 px-4 border-b border-white/10">
        <img
          src={logo}
          alt="Logo"
          className="h-8 w-8 object-contain flex-shrink-0"
        />

        <span
          className={`font-bold text-white text-xl whitespace-nowrap transition-all duration-300 ease-in-out ${
            collapsed ? "hidden" : "block"
          }`}
        >
          AgriNet <span className="font-light">Lucena</span>
        </span>
      </div>

      {/* Profile */}

      <div className="px-4 py-4 border-b border-white/10">
        <UserIdentity user={profile} onlyPic={collapsed} showUsername={false} showRole={true} showVerified={false} colorWhite={true} size="lg" />
      </div>

      {/* Navigation */}

      <nav className="flex-1 py-4">
        {items.map((item) => {
          const isMessages = item.to.includes("messages");
          const isInquiries = item.to.includes("inquiries");
          const isReports = item.to.includes("reports");

          return (
            <div key={item.to} className="relative">
              <NavLink
                to={item.to}
                end
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-all ${
                    collapsed ? "justify-center" : "justify-start"
                  } ${
                    isActive
                      ? "bg-white/20 text-white font-semibold"
                      : "text-green-200/75 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <div className="relative flex items-center justify-center">
                  <i className={`${item.icon} text-base`} />
                  {isMessages && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#1B4332] shadow-xs leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                  {isInquiries && inquiryActionCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#1B4332] shadow-xs leading-none">
                      {inquiryActionCount > 99 ? "99+" : inquiryActionCount}
                    </span>
                  )}
                  {isReports && pendingReportsCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#1B4332] shadow-xs leading-none">
                      {pendingReportsCount > 99 ? "99+" : pendingReportsCount}
                    </span>
                  )}
                </div>

                <span className={collapsed ? "hidden" : "block"}>{item.label}</span>
              </NavLink>

              {/* Speech bubble — messages */}
              {isMessages && showPopup && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-left-2">
                  <div className="relative flex items-center gap-2.5 whitespace-nowrap rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1B4332] shadow-2xl shadow-black/20 border border-gray-100 ring-1 ring-black/5">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rotate-45 border-l border-b border-gray-100" />
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                      <span>New messages</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Speech bubble — inquiries */}
              {isInquiries && showInquiryPopup && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-left-2">
                  <div className="relative flex items-center gap-2.5 whitespace-nowrap rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1B4332] shadow-2xl shadow-black/20 border border-gray-100 ring-1 ring-black/5">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rotate-45 border-l border-b border-gray-100" />
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                      <span>{inquiryPopupMessage}</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Speech bubble — reports */}
              {isReports && showReportPopup && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-left-2">
                  <div className="relative flex items-center gap-2.5 whitespace-nowrap rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1B4332] shadow-2xl shadow-black/20 border border-gray-100 ring-1 ring-black/5">
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rotate-45 border-l border-b border-gray-100" />
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                      </span>
                      <span>{reportPopupMessage || "New report needs review!"}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}

      <div className="border-t border-white/10 p-3 space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-start gap-3 px-4 py-2 rounded-lg text-green-200/60 hover:text-white hover:bg-white/10 text-sm transition-colors duration-200 cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <i
              className={`text-base ${
                !collapsed ? "ri-arrow-left-s-line" : "ri-arrow-right-s-line"
              }`}
            />
          </div>

          <span className={collapsed ? "hidden" : "block"}>
            {collapsed ? "Expand" : "Collapse"}
          </span>
        </button>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="bg-[#dc2626]/25 text-white/80 hover:bg-[#dc2626]/40 hover:text-white w-full flex items-center justify-start px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <i className="ri-logout-box-line text-base" />
          </div>

          <span
            className={`flex-1 text-center pr-5 text-sm whitespace-nowrap font-medium ${
              collapsed ? "hidden" : "block"
            }`}
          >
            Logout
          </span>
        </button>
      </div>

      <LogoutConfirmModal
        open={showLogoutModal}
        loggingOut={loggingOut}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </aside>
  );
}
