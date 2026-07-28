import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import defaultAvatar from "../assets/img/defaultAvatar.png";

export default function Header({ title = "Dashboard" }) {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 right-0 h-16 bg-white/90 border-b border-gray-100 flex items-center justify-between px-4 md:px-6 z-999">
      <div className="flex items-center gap-3">
        <h2 className="font-bold text-[#1B4332] text-base">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:text-[#2D6A4F] hover:bg-gray-100 rounded-lg transition-colors">
          <i className="ri-notification-3-line text-lg" />

          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <Link
          to="/profile"
          className="flex items-center gap-2 pl-2 border-l border-gray-200"
        >
          <img
            src={profile?.profilePicture || defaultAvatar}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover object-top"
          />

          <div className="hidden md:block">
            <p className="text-xs font-semibold text-gray-800">
              {profile?.fullname}
            </p>

            <p className="text-xs text-gray-400 capitalize">{profile?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
