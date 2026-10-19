import BottomNavigation from "./BottomNavigation";

import { useAuth } from "../../context/AuthContext";
import { consumerNavigation, navigationByRole } from "../../constants/navigation";
import { getProfilePath } from "../../utils/routes";

export default function BottomTab({ showBottomTab }) {
  const { identity } = useAuth();

  const baseNav = identity?.role
    ? (navigationByRole[identity.role] ?? consumerNavigation)
    : consumerNavigation;

  const items = baseNav.filter((item) => item.bottom).map((item) => item.kind === "profile"
    ? { ...item, to: getProfilePath(identity?.username) }
    : item);

  return showBottomTab && <BottomNavigation items={items} />;
}
