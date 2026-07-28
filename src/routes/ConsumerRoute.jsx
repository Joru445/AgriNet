import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";

export default function ConsumerRoute() {
  const { user, profile, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/login" replace />;

  if (profile.role !== "consumer") return <Navigate to="/farmer" replace />;

  return <Outlet />;
}
