import api from './api';
import type { User, Role } from '../types/auth';

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  mobile: string;
  role: Role;
  showroomId?: string;
}

export interface UpdateUserPayload {
  name?: string;
  mobile?: string;
  email?: string;
}

export interface UpdateRolePayload {
  role: Role;
  showroomId?: string;
}

/**
 * Create a new user (Super Admin only)
 */
export async function createUser(payload: CreateUserPayload) {
  try {
    const response = await api.post('/api/auth/register', payload);
    const userData = response.data.user;
    
    const user: User = {
      id: userData.uid,
      fullName: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role,
      showroomId: userData.showroomId || undefined,
    };
    
    return { success: true, user };
  } catch (error: any) {
    console.error('Create user error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'CREATE_USER_ERROR',
        message: error.message || 'Failed to create user',
      },
    };
  }
}

/**
 * List all users
 */
export async function listUsers() {
  try {
    const response = await api.get('/api/users');
    const users: User[] = response.data.users.map((userData: any) => ({
      id: userData.uid,
      fullName: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role,
      showroomId: userData.showroomId || undefined,
    }));
    
    return { success: true, users };
  } catch (error: any) {
    console.error('List users error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'LIST_USERS_ERROR',
        message: error.message || 'Failed to fetch users',
      },
      users: [],
    };
  }
}

/**
 * Get single user by ID
 */
export async function getUser(uid: string) {
  try {
    const response = await api.get(`/api/users/${uid}`);
    const userData = response.data.user;
    
    const user: User = {
      id: userData.uid,
      fullName: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role,
      showroomId: userData.showroomId || undefined,
    };
    
    return { success: true, user };
  } catch (error: any) {
    console.error('Get user error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'GET_USER_ERROR',
        message: error.message || 'Failed to fetch user',
      },
    };
  }
}

/**
 * Update user profile
 */
export async function updateUser(uid: string, payload: UpdateUserPayload) {
  try {
    const response = await api.patch(`/api/users/${uid}`, payload);
    const userData = response.data.user;
    
    const user: User = {
      id: userData.uid,
      fullName: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role,
      showroomId: userData.showroomId || undefined,
    };
    
    return { success: true, user };
  } catch (error: any) {
    console.error('Update user error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'UPDATE_USER_ERROR',
        message: error.message || 'Failed to update user',
      },
    };
  }
}

/**
 * Update user role (Super Admin only)
 */
export async function updateUserRole(uid: string, payload: UpdateRolePayload) {
  try {
    const response = await api.patch(`/api/users/${uid}/role`, payload);
    const userData = response.data.user;
    
    const user: User = {
      id: userData.uid,
      fullName: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      role: userData.role,
      showroomId: userData.showroomId || undefined,
    };
    
    return { success: true, user };
  } catch (error: any) {
    console.error('Update user role error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'UPDATE_ROLE_ERROR',
        message: error.message || 'Failed to update user role',
      },
    };
  }
}

/**
 * Delete user (Super Admin only)
 */
export async function deleteUser(uid: string) {
  try {
    await api.delete(`/api/users/${uid}`);
    return { success: true };
  } catch (error: any) {
    console.error('Delete user error:', error);
    return {
      success: false,
      error: {
        code: error.code || 'DELETE_USER_ERROR',
        message: error.message || 'Failed to delete user',
      },
    };
  }
}
