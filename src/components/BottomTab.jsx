import BottomNavigation from "./BottomNavigation";

import { useAuth } from "../context/AuthContext";
import { consumerNavigation, navigationByRole } from "../constants/navigation";

export default function BottomTab({ showBottomTab }) {
  const { profile } = useAuth();

  const items = (profile ? navigationByRole[profile.role] : consumerNavigation).filter(
    (item) => item.bottom,
  );

  return showBottomTab && <BottomNavigation items={items} />;
}
