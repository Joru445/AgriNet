import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Loading from "../components/Loading";

export default function HomeRedirect() {
  const { user, profile, loading } = useAuth();

  if (loading) return <Loading />;

  if (!user) return <Navigate to="/landing" replace />;

  if (profile.role === "farmer") return <Navigate to="/farmer" replace />;

  return <Navigate to="/home" replace />;
}
