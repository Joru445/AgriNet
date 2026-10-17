import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfilePath } from "../utils/routes";
import { getPublicProfile } from "../services/user.service";

/**
 * Avatar click → navigate to profile OR open lightbox.
 *
 * If the current URL matches the target user's canonical profile page,
 * opens the lightbox.
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
      const profileUrl = getProfilePath(targetUser?.username);
      if (!profileUrl && uid) {
        getPublicProfile(uid)
          .then((payload) => {
            const resolvedPath = getProfilePath(payload?.profile?.username);
            if (resolvedPath) navigate(resolvedPath);
          })
          .catch(() => {});
        return;
      }
      if (!profileUrl) return;
      const isOnProfile = location.pathname === profileUrl;

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
