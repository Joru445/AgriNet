import BottomNavigation from "./BottomNavigation";

import { useAuth } from "../context/AuthContext";

import { farmerNavigation, consumerNavigation } from "../constants/navigation";

export default function BottomTab() {
  const { profile } = useAuth();

  const items = (
    profile.role === "farmer" ? farmerNavigation : consumerNavigation
  ).filter((item) => item.bottom);

  return <BottomNavigation items={items} />;
}
