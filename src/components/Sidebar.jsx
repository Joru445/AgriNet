import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { farmerNavigation, consumerNavigation } from "../constants/navigation";
import { showToast }from "../utils/toast"

import logo from "../assets/favicon.ico";
import placeholder from "../assets/img/defaultAvatar.png";

export default function Sidebar({ collapsed, setCollapsed }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();

      showToast.success("Logged out.");

      navigate("/login");
    } catch (error) {
      console.error(error);

      showToast.error(error.message);
    }
  }

  const items =
    profile.role === "farmer" ? farmerNavigation : consumerNavigation;

  return (
    <aside
      className={`hidden lg:flex fixed top-0 left-0 h-full bg-[#1B4332] flex-col z-40 overflow-hidden transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"}`}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <img
          alt="Logo"
          className={`h-8 w-8 object-contain flex-shrink-0 ${collapsed ? "justify-center" : "justify-start"}`}
          src={logo}
        />
        <span
          className={`font-bold text-white text-sm whitespace-nowrap transition-all duration-300 ease-in-out ${collapsed ? "hidden" : "block"}`}
        >
          AgriNet <span className="font-light">Lucena</span>
        </span>
      </div>
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            className={`w-10 h-10 rounded-full object-cover object-top border-2 border-green-400 flex-shrink-0 ${collapsed ? "justify-center" : "justify-start"}`}
            src={profile.profilePicture || placeholder}
          />

          <div className="min-w-0 transition-all duration-300 ease-in-out">
            <p
              className={`text-white font-semibold text-sm truncate ${collapsed ? "hidden" : "block"}`}
            >
              {profile.fullname || "User"}
            </p>

            <p
              className={`text-green-300 text-xs truncate capitalize ${collapsed ? "hidden" : "block"}`}
            >
              {profile.role || "Consumer"}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-all ${collapsed ? "justify-center" : "justify-start"} ${
                isActive
                  ? "bg-white/20 text-white font-semibold"
                  : "text-green-200/75 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <i className={`${item.icon} text-base`} />

            <span className={collapsed ? "hidden" : "block"}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-start gap-3 px-4 py-2 rounded-lg text-green-200/60 hover:text-white hover:bg-white/10 text-sm transition-colors duration-200 cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <i
              className={`text-base ${!collapsed ? "ri-arrow-left-s-line" : "ri-arrow-right-s-line"}`}
            ></i>
          </div>
        </button>

        <button
          onClick={handleLogout}
          className="bg-[#dc2626]/25 text-white/80 hover:bg-[#dc2626]/40 hover:text-white w-full flex items-center justify-start px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <i className="ri-logout-box-line text-base"></i>
          </div>
          <span
            className={`flex-1 text-center pr-5 text-sm whitespace-nowrap font-medium ${collapsed ? "hidden" : "block"}`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
