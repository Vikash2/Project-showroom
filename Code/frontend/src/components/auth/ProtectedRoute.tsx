import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import type { Role } from '../../types/auth';
import { useShowroom } from '../../state/ShowroomContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const { activeShowroom } = useShowroom();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] transition-colors duration-500">
        <div 
            className="w-12 h-12 border-4 border-[var(--border)] border-t-transparent rounded-full animate-spin shadow-lg"
            style={{ borderTopColor: activeShowroom.branding.primaryColor }}
        ></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    // Role not authorized — staff without specific permission go to admin root
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}
