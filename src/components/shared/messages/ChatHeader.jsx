import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "../../common/Avatar";
import BackButton from "../../common/BackButton";

export default function ChatHeader({ user }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  if (!user) return null;

  const targetUid = user.uid || user.id;

  function handleVisitStore() {
    setMenuOpen(false);
    if (targetUid) {
      navigate(`/profile/${targetUid}`);
    }
  }

  return (
    <header
      className="w-full h-16 sm:h-18 shrink-0 border-b px-4 sm:px-6 flex items-center justify-between shadow-xs z-10"
      style={{
        backgroundColor: "rgba(247,250,248,0.97)",
        borderColor: "var(--agri-border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <BackButton className="flex sm:hidden" />

        <Avatar src={user.profilePicture} name={user.fullname} size="sm" />

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {user.fullname}
            </h3>
            {user.verified && (
              <span
                title="Verified Farmer"
                aria-label="Verified Farmer"
                className="inline-flex shrink-0 items-center text-[#2D6A4F] text-base"
              >
                <i className="ri-verified-badge-fill" />
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 truncate">
            @{user.username}
          </p>
        </div>
      </div>

      <div className="relative flex items-center gap-2" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
            menuOpen ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100 text-gray-600"
          }`}
          title="More options"
          aria-expanded={menuOpen}
        >
          <i className="ri-more-2-fill text-xl" />
        </button>

        {/* 3-dots dropdown menu */}
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white p-1.5 shadow-xl border border-gray-200 ring-1 ring-black/5 z-50 animate-scale-in">
            <button
              type="button"
              onClick={handleVisitStore}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-[#F4F9F6] hover:text-[#1B4332] transition cursor-pointer"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F5EE] text-[#2D6A4F]">
                <i className="ri-store-2-line text-lg" />
              </div>
              <span>Visit Store</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
