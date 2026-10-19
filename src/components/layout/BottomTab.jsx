import BottomNavigation from "./BottomNavigation";

import { useAuth } from "../../context/AuthContext";
import { consumerNavigation, navigationByRole } from "../../constants/navigation";
import { getProfilePath } from "../../utils/routes";

export default function BottomTab({ showBottomTab }) {
  const { identity } = useAuth();

  const baseNav = identity?.role
    ? (navigationByRole[identity.role] ?? consumerNavigation)
    : consumerNavigation;

  const profilePath = getProfilePath(identity?.username) || "/profile";
  const items = baseNav.filter((item) => item.bottom).map((item) => item.kind === "profile"
    ? { ...item, to: profilePath }
    : item);

  return showBottomTab && <BottomNavigation items={items} />;
}
