import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import type { Role } from '../types/auth';

/**
 * Hook to guard routes and redirect based on authentication and role
 * @param requiredRoles - Optional array of roles that are allowed to access
 * @param redirectTo - Where to redirect if not authorized (default: '/login')
 */
export function useAuthGuard(requiredRoles?: Role[], redirectTo: string = '/login') {
  const { user, isAuthenticated, isInitializing, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for initialization to complete
    if (isInitializing) return;

    // Check authentication
    if (!isAuthenticated || !user) {
      console.log('[useAuthGuard] Not authenticated, redirecting to:', redirectTo);
      navigate(redirectTo, { replace: true });
      return;
    }

    // Check role authorization
    if (requiredRoles && requiredRoles.length > 0) {
      if (!hasRole(requiredRoles)) {
        console.log('[useAuthGuard] User role not authorized:', user.role);
        navigate('/admin', { replace: true });
      }
    }
  }, [isAuthenticated, isInitializing, user, requiredRoles, hasRole, navigate, redirectTo]);

  return { user, isAuthenticated, isInitializing };
}

/**
 * Hook to redirect authenticated users away from public pages (like login)
 * @param redirectTo - Where to redirect authenticated users (default: '/admin')
 */
export function useGuestOnly(redirectTo: string = '/admin') {
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      console.log('[useGuestOnly] Already authenticated, redirecting to:', redirectTo);
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate, redirectTo]);

  return { isInitializing };
}
