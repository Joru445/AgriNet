import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import Avatar from "../../common/Avatar";
import BackButton from "../../common/BackButton";
import UserProfileModal from "./UserProfileModal";
import ReportModal from "../../common/ReportModal";

import { getProfilePath } from "../../../utils/routes";

export default function ChatHeader({ user }) {
  const { profile } = useAuth();

  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
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
  const isAdmin = user.role === "admin";

  const profilePath = getProfilePath(profile.role)

  function handleAction() {
    setMenuOpen(false);
    if (isFarmer) {
      if (targetUid) {
        navigate(`${profilePath}/${targetUid}`);
      }
    } else {
      setShowProfileModal(true);
    }
  }

  function handleReport() {
    setMenuOpen(false);
    setShowReportModal(true);
  }

  return (
    <>
      <header
        className="w-full h-16 sm:h-18 shrink-0 bg-[var(--agri-bg)]/90 border-b border-[var(--agri-border-subtle)] px-4 sm:px-6 flex items-center justify-between shadow-xs z-10"
      >
        <div className="flex items-center gap-3 min-w-0">
          <BackButton className="flex sm:hidden" />

          <Avatar src={user.profilePicture} name={user.fullname} size="sm" />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-semibold text-[var(--agri-text)] truncate">
                {user.fullname}
              </h3>
              {user.verified && (
                <span
                  title="Verified Farmer"
                  aria-label="Verified Farmer"
                  className="inline-flex shrink-0 items-center text-[#2D6A4F] dark:text-[var(--agri-brand)] text-base"
                >
                  <i className="ri-verified-badge-fill" />
                </span>
              )}
              {isAdmin && (
                <span
                  title="Official Admin"
                  aria-label="Official Admin"
                  className="inline-flex shrink-0 items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/20 shadow-2xs"
                >
                  Admin
                </span>
              )}
            </div>

            <p className="text-sm text-[var(--agri-text-muted)] truncate">
              @{user.username}
            </p>
          </div>
        </div>

        {!isAdmin && (
          <div className="relative flex items-center gap-2" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${menuOpen ? "bg-[var(--agri-hover)] text-[var(--agri-text)]" : "hover:bg-[var(--agri-hover)] text-[var(--agri-text-secondary)]"
                }`}
              title="More options"
              aria-expanded={menuOpen}
            >
              <i className="ri-more-2-fill text-lg" />
            </button>

            {/* 3-dots dropdown menu */}
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 sm:w-44 rounded-xl bg-[var(--agri-card)] p-1 shadow-lg border border-[var(--agri-border)] ring-1 ring-black/5 z-50 anim-scale-in">
                <button
                  type="button"
                  onClick={handleAction}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-[var(--agri-text-secondary)] hover:bg-[#2D6A4F]/10 hover:text-[#1B4332] dark:hover:text-[var(--agri-brand-light)] transition-colors cursor-pointer"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-[var(--agri-brand)]">
                    <i className={isFarmer ? "ri-store-2-line text-sm" : "ri-user-3-line text-sm"} />
                  </div>
                  <span className="truncate">{isFarmer ? "Visit Store" : "View Profile"}</span>
                </button>

                <div className="my-1 border-t border-[var(--agri-border-subtle)]" />

                <button
                  type="button"
                  onClick={handleReport}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-red-500/10 text-red-600">
                    <i className="ri-alert-line text-sm" />
                  </div>
                  <span className="truncate">Report User</span>
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Consumer / User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="message"
        targetId={targetUid}
        targetTitle={`Conversation with ${user.fullname || user.username}`}
        reportedUser={user}
      />
    </>
  );
}
