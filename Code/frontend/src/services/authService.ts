import { supabase } from '../config/supabase';
import api from './api';
import type { User } from '../types/auth';

/**
 * Login with email and password using Supabase Auth
 */
export async function loginWithEmail(email: string, password: string) {
  try {
    console.log('🔐 authService: Starting login for', email);
    
    // Sign in with Supabase Auth
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('🔐 authService: Supabase signIn result', { 
      hasData: !!data, 
      hasSession: !!data?.session, 
      error: signInError?.message 
    });
    
    if (signInError) {
      throw signInError;
    }
    
    if (!data.session) {
      throw new Error('No session returned from Supabase');
    }
    
    console.log('🔐 authService: Fetching user profile from backend');
    
    // Get user profile from backend
    const response = await api.get('/api/auth/me');
    
    console.log('🔐 authService: Backend response received', { 
      status: response.status, 
      hasUser: !!response.data?.user 
    });
    
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
    
    console.log('🔐 authService: Login successful', { userId: user.id, role: user.role });
    
    return { success: true, user, token: data.session.access_token };
  } catch (error: any) {
    console.error('🔐 authService: Login error', error);
    
    // Handle Supabase Auth errors
    if (error.message?.includes('Invalid login credentials') || error.status === 400) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          userMessage: 'Invalid email or password. Please check your credentials.',
        },
      };
    } else if (error.status === 429) {
      return {
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many failed login attempts',
          userMessage: 'Too many failed attempts. Please try again later.',
        },
      };
    } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error',
          userMessage: 'Unable to connect. Please check your internet connection and ensure the backend server is running.',
        },
      };
    } else if (error.response?.status === 404) {
      return {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found',
          userMessage: 'User profile not found. Please contact your administrator.',
        },
      };
    } else if (error.response?.status === 401) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
          userMessage: 'Authentication failed. Please try logging in again.',
        },
      };
    }
    
    return {
      success: false,
      error: {
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'An error occurred',
        userMessage: error.response?.data?.error || 'Login failed. Please try again.',
      },
    };
  }
}

/**
 * Logout user
 */
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
