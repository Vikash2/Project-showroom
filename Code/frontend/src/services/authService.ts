import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';
import type { User } from '../types/auth';

/**
 * Login with email and password using Firebase Auth
 */
export async function loginWithEmail(email: string, password: string) {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get ID token
    const idToken = await userCredential.user.getIdToken();
    
    // Get user profile from backend
    const response = await api.get('/api/auth/me');
    const userData = response.data.user;
    
    // Map backend user to frontend User type
    const user: User = {
      id: userData.uid,
      fullName: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role,
      showroomId: userData.showroomId || undefined,
    };
    
    return { success: true, user, token: idToken };
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle Firebase Auth errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          userMessage: 'Invalid email or password. Please check your credentials.',
        },
      };
    } else if (error.code === 'auth/too-many-requests') {
      return {
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many failed login attempts',
          userMessage: 'Too many failed attempts. Please try again later.',
        },
      };
    } else if (error.code === 'auth/network-request-failed') {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error',
          userMessage: 'Unable to connect. Please check your internet connection.',
        },
      };
    }
    
    return {
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An error occurred',
        userMessage: 'Login failed. Please try again.',
      },
    };
  }
}

/**
 * Logout user
 */
export async function logout() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'LOGOUT_ERROR',
        message: error.message || 'Logout failed',
      },
    };
  }
}

/**
 * Get current user profile from backend
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get('/api/auth/me');
    const userData = response.data.user;
    
    return {
      id: userData.uid,
      fullName: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role,
      showroomId: userData.showroomId || undefined,
    };
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
