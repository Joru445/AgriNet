import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "../../common/Avatar";
import BackButton from "../../common/BackButton";
import UserProfileModal from "./UserProfileModal";

export default function ChatHeader({ user }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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
  const isFarmer = user.role === "farmer";

  function handleAction() {
    setMenuOpen(false);
    if (isFarmer) {
      if (targetUid) {
        navigate(`/profile/${targetUid}`);
      }
    } else {
      setShowProfileModal(true);
    }
  }

  return (
    <>
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
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
              menuOpen ? "bg-gray-200 text-gray-900" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="More options"
            aria-expanded={menuOpen}
          >
            <i className="ri-more-2-fill text-lg" />
          </button>

          {/* 3-dots dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-36 sm:w-40 rounded-xl bg-white p-1 shadow-lg border border-gray-200/90 ring-1 ring-black/5 z-50 animate-scale-in">
              <button
                type="button"
                onClick={handleAction}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 hover:bg-[#E8F5EE] hover:text-[#1B4332] transition-colors cursor-pointer"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E8F5EE] text-[#2D6A4F]">
                  <i className={isFarmer ? "ri-store-2-line text-sm" : "ri-user-3-line text-sm"} />
                </div>
                <span className="truncate">{isFarmer ? "Visit Store" : "View Profile"}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Consumer / User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
}
