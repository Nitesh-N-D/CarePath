import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth, type UserRole } from "../context/AuthContext";
import GlassCard from "./ui/GlassCard";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <GlassCard className="flex items-center gap-3 px-6 py-4 text-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-accent" />
          Validating your secure CarePath session...
        </GlassCard>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === "admin" ? "/admin" : user.role === "doctor" ? "/doctor" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
