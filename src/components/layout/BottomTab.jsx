import BottomNavigation from "./BottomNavigation";

import { useAuth } from "../../context/AuthContext";
import { consumerNavigation, navigationByRole } from "../../constants/navigation";
import { getProfilePath } from "../../utils/routes";

export default function BottomTab({ showBottomTab }) {
  const { identity } = useAuth();

  const baseNav = identity?.role
    ? (navigationByRole[identity.role] ?? consumerNavigation)
    : consumerNavigation;

  const items = baseNav.filter((item) => item.bottom).map((item) => {
    if (item.kind !== "profile") return item;
    // Guests have no profile of their own: route the tab to login instead of
    // disabling it, matching how other protected tabs behave for guests.
    if (!identity?.username) {
      return { ...item, to: "/login" };
    }
    return { ...item, to: getProfilePath(identity.username) };
  });

  return showBottomTab && <BottomNavigation items={items} />;
}
