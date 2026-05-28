import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  console.log("AdminRoute: isLoading", isLoading);
  console.log("AdminRoute: isAuthenticated", isAuthenticated);
  console.log("AdminRoute: user", user);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-organic-cream via-white to-organic-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-organic-brown mx-auto"></div>
          <p className="mt-4 text-organic-brown font-acme">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("AdminRoute: not authenticated, redirecting to /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if ((user as any)?.role !== 'admin') {
    console.log("AdminRoute: user is not admin, redirecting to /", user);
    return <Navigate to="/" replace />;
  }

  console.log("AdminRoute: user is admin, rendering children");

  return <>{children}</>;
}
