import { Link, useLocation } from "react-router-dom";

import BackButton from "./common/BackButton";
import UserIdentity from "./common/UserIdentity";

import { getRoleHome } from "../utils/routes";

export default function Header({ user, collapsed }) {
  const location = useLocation();
  console.log(user);

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
  const roleAddress = getRoleHome(user.role);

  const showBackButton = !tabRoutes.includes(location.pathname);

  return (
    <header className="sticky top-0 right-0 z-40 flex h-16 items-center justify-between border-b border-gray-100 bg-white/95 px-4 md:px-6">
      <div className="flex w-10 items-center">
        {showBackButton ? (
          <BackButton />
        ) : (
          <span
            className={`font-bold text-gray-800 text-sm whitespace-nowrap transition-all duration-300 ease-in-out ${
              !collapsed ? "hidden" : "block"
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
          to={`${roleAddress}/notifications`"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#2D6A4F]"
          aria-label="Notifications"
        >
          <i className="ri-notification-3-line text-lg" />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Link>

        <Link
          to={`${roleAddress}/me`}
          className="flex items-center gap-2 border-l border-gray-200 pl-2"
        >
          <UserIdentity user={user} showUsername={false} showRole={true} />
        </Link>
      </div>
    </header>
  );
}
