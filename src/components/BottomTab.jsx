import BottomNavigation from "./BottomNavigation";

import { useAuth } from "../context/AuthContext";
import { consumerNavigation, navigationByRole } from "../constants/navigation";

export default function BottomTab({ showBottomTab }) {
  const { identity } = useAuth();

  const baseNav = identity?.role
    ? (navigationByRole[identity.role] ?? consumerNavigation)
    : consumerNavigation;

  const items = baseNav.filter((item) => item.bottom);

  return showBottomTab && <BottomNavigation items={items} />;
}
