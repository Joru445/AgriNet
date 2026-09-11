import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Avatar click → navigate to profile OR open lightbox.
 *
 * If the current URL matches the target user's profile page
 * (/profile/:uid or /farmer/profile/:uid), opens the lightbox.
 * Otherwise navigates to their profile.
 *
 * Usage:
 *   const { handleAvatarClick, lightbox, closeLightbox } = useProfileViewer();
 *   <Avatar onClick={handleAvatarClick(user)} ... />
 *   <ImageViewerModal isOpen={!!lightbox} src={lightbox?.src} onClose={closeLightbox} />
 */
export default function useProfileViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const [lightbox, setLightbox] = useState(null);

  const handleAvatarClick = useCallback(
    (targetUser) => (e) => {
      e.stopPropagation();
      e.preventDefault();

      const uid = targetUser?.uid || targetUser?.id;
      if (!uid) return;

      const profileUrl = `/profile/${uid}`;
      const farmerProfileUrl = `/farmer/profile/${uid}`;
      const isOnProfile =
        location.pathname === profileUrl ||
        location.pathname === farmerProfileUrl;

      if (isOnProfile) {
        setLightbox({
          src: targetUser.profilePicture,
          title: targetUser.fullname || "",
        });
      } else {
        navigate(profileUrl);
      }
    },
    [location.pathname, navigate],
  );

  const closeLightbox = useCallback(() => setLightbox(null), []);

  return { handleAvatarClick, lightbox, closeLightbox };
}
