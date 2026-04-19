import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';
import * as authService from '../services/authService';
import type { User, Role, AuthError } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  error: AuthError | null;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => void;
  hasRole: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Changed to false - only true during actual login
  const [isInitializing, setIsInitializing] = useState(true); // Separate state for initial session check
  const [error, setError] = useState<AuthError | null>(null);

  // Initialize auth state and listen to changes
  useEffect(() => {
    let isMounted = true;
    let isInitialized = false;

    const handleAuthState = async (event: string, session: any) => {
      if (!isMounted) return;

      console.log('🔐 AuthContext: Auth state changed:', event, { hasSession: !!session });

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔐 AuthContext: User signed in, fetching profile');
        try {
          const userData = await authService.getCurrentUser();
          
          if (!isMounted) return;

          if (userData) {
            if (userData.role === 'Customer') {
              console.log('🔐 AuthContext: Customer role detected, denying access');
              await authService.logout();
              setUser(null);
              toast.error('Access denied. Only showroom staff can access this portal.');
            } else {
              console.log('🔐 AuthContext: Setting user:', userData.role);
              setUser(userData);
            }
          } else {
            console.log('🔐 AuthContext: No user data received, logging out');
            await authService.logout();
            setUser(null);
          }
        } catch (error) {
          console.error('🔐 AuthContext: Error fetching user profile:', error);
          if (isMounted) {
            setUser(null);
          }
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        console.log('🔐 AuthContext: User signed out or no session');
        setUser(null);
      }

      // Mark as initialized after first auth state check
      if (!isInitialized && isMounted) {
        isInitialized = true;
        setIsInitializing(false);
        console.log('🔐 AuthContext: Initialization complete');
      }
    };

    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthState);

    // Check initial session
    const initializeAuth = async () => {
      console.log('🔐 AuthContext: Checking initial session');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        // Handle initial session through the same auth state handler
        if (session) {
          await handleAuthState('INITIAL_SESSION', session);
        } else {
          // No session, just mark as initialized
          if (!isInitialized && isMounted) {
            isInitialized = true;
            setIsInitializing(false);
            console.log('🔐 AuthContext: No initial session, initialization complete');
          }
        }
      } catch (error) {
        console.error('🔐 AuthContext: Error checking initial session:', error);
        if (!isInitialized && isMounted) {
          isInitialized = true;
          setIsInitializing(false);
        }
      }
    };

    // Start initialization
    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔐 AuthContext: Login attempt started for:', email);
      
      const result = await authService.loginWithEmail(email, password);
      
      console.log('🔐 AuthContext: Login service result:', { success: result.success, hasUser: !!result.user });
      
      if (result.success && result.user) {
        // Check if user is staff
        if (result.user.role === 'Customer') {
          await authService.logout();
          const err: AuthError = {
            code: 'UNAUTHORIZED_ROLE',
            message: 'Non-staff role attempt',
            userMessage: 'Access denied. Only showroom staff can access this portal.',
          };
          setError(err);
          return { success: false, error: err };
        }
        
        // Don't set user here - let the auth state listener handle it
        // This prevents race conditions and double state updates
        console.log('🔐 AuthContext: Login successful, auth listener will handle user state');
        return { success: true };
      } else {
        const err = result.error || {
          code: 'UNKNOWN_ERROR',
          message: 'Login failed',
          userMessage: 'Login failed. Please try again.',
        };
        setError(err);
        return { success: false, error: err };
      }
    } catch (error: any) {
      console.error('🔐 AuthContext: Unexpected login error:', error);
      const err: AuthError = {
        code: 'UNEXPECTED_ERROR',
        message: error.message || 'Unexpected error',
        userMessage: 'An unexpected error occurred. Please try again.',
      };
      setError(err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
      console.log('🔐 AuthContext: Login loading state reset');
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setError(null);
  };

  const hasRole = (allowedRoles: Role[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  // Show nothing while initializing to prevent flash of login page
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-secondary)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)] text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, isInitializing, error, loginWithEmail, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
