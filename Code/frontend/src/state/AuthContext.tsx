import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';
import { auth } from '../config/firebase';
import * as authService from '../services/authService';
import type { User, Role, AuthError } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => void;
  hasRole: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get profile from backend
        try {
          const userData = await authService.getCurrentUser();
          if (userData) {
            // Check if user is staff (not customer)
            if (userData.role === 'Customer') {
              await authService.logout();
              setUser(null);
              toast.error('Access denied. Only showroom staff can access this portal.');
            } else {
              setUser(userData);
            }
          } else {
            // Profile not found in backend
            await authService.logout();
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError }> => {
    setIsLoading(true);
    setError(null);
    
    const result = await authService.loginWithEmail(email, password);
    
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
        setIsLoading(false);
        return { success: false, error: err };
      }
      
      setUser(result.user);
      setIsLoading(false);
      return { success: true };
    } else {
      setError(result.error || null);
      setIsLoading(false);
      return { success: false, error: result.error };
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

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, error, loginWithEmail, logout, hasRole }}>
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
