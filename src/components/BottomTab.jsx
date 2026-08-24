import BottomNavigation from "./BottomNavigation";

import { useAuth } from "../context/AuthContext";
import { navigationByRole } from "../constants/navigation";

export default function BottomTab({ showBottomTab }) {
  const { profile } = useAuth();

  const items = (navigationByRole[profile?.role] ?? []).filter(
    (item) => item.bottom,
  );

  return showBottomTab && <BottomNavigation items={items} />;
}
