import { Link, useLocation } from "react-router-dom";

import BackButton from "./common/BackButton";
import UserIdentity from "./common/UserIdentity";

import { getMePath, getNotificationsPath } from "../utils/routes";

export default function Header({ user, collapsed }) {
  const location = useLocation();

  const tabRoutes = [
    "/home",
    "/products",
    "/messages",
    "/inquiries",
    "/me",

    "/farmer",
    "/farmer/products",
    "/farmer/inquiries",
    "/farmer/messages",
    "/farmer/me",

    "/admin",
    "/admin/reports",
    "/admin/messages",
    "/admin/me",
  ];
  
  const notificationPath = getNotificationsPath(user.role);
  const mePath = getMePath(user.role);

  const showBackButton = !tabRoutes.includes(location.pathname);

  return (
    <header className="sticky top-0 right-0 z-40 flex h-16 items-center justify-between border-b px-4 md:px-6" style={{ backgroundColor: 'rgba(240,247,242,0.97)', borderColor: 'var(--agri-border)' }}>
      <div className="flex items-center">
        {showBackButton ? (
          <BackButton />
        ) : (
          <span
            className={`font-bold text-gray-800 text-lg sm:text-xl md:text-2xl whitespace-nowrap transition-all duration-300 ease-in-out ${
              !collapsed ? "lg:hidden" : "block"
            }`}
          >
            AgriNet <span className="font-light">Lucena</span>
          </span>
        )}
      </div>

      {user.status === "suspended" && (
        <span className="text-red-500">Your account are suspended!</span>
      )}

      <div className="flex items-center gap-2">
        <Link
          to={notificationPath}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#2D6A4F]"
          aria-label="Notifications"
        >
          <i className="ri-notification-3-line text-lg" />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Link>

        <Link
          to={mePath}
          className="flex items-center gap-2 border-l border-gray-200 pl-2"
        >
          <UserIdentity user={user} showUsername={false} showRole={true} />
        </Link>
      </div>
    </header>
  );
}
