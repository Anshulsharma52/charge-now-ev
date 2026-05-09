import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (!isAuthenticated || !user) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === 'station') {
      return <Navigate to="/station" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
