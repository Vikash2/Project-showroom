import type { Role } from '../types/auth';

/**
 * Check if a role has access to a specific feature
 */
export function hasAccess(userRole: Role, allowedRoles: Role[]): boolean {
  // Super Admin has access to everything
  if (userRole === 'Super Admin') return true;
  
  return allowedRoles.includes(userRole);
}

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export function getRoleLevel(role: Role): number {
  const roleLevels: Record<Role, number> = {
    'Super Admin': 100,
    'Showroom Manager': 80,
    'Accountant': 60,
    'Documentation Officer': 50,
    'Sales Executive': 40,
    'Cashier': 30,
    'Customer': 10,
  };
  
  return roleLevels[role] || 0;
}

/**
 * Check if user role is higher than or equal to required role
 */
export function hasMinimumRole(userRole: Role, minimumRole: Role): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(minimumRole);
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    'Super Admin': 'System Administrator',
    'Showroom Manager': 'Showroom Manager',
    'Sales Executive': 'Sales Consultant',
    'Accountant': 'Accounts Officer',
    'Documentation Officer': 'Records Officer',
    'Cashier': 'Cashier',
    'Customer': 'Customer',
  };
  
  return displayNames[role] || role;
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: Role): string {
  const colors: Record<Role, string> = {
    'Super Admin': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'Showroom Manager': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Sales Executive': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Accountant': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Documentation Officer': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    'Cashier': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    'Customer': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };
  
  return colors[role] || 'bg-gray-100 text-gray-800';
}

/**
 * Check if role is staff (not customer)
 */
export function isStaffRole(role: Role): boolean {
  return role !== 'Customer';
}

/**
 * Get allowed routes for a role
 */
export function getAllowedRoutes(role: Role): string[] {
  const routes: Record<Role, string[]> = {
    'Super Admin': [
      '/admin',
      '/admin/showrooms',
      '/admin/vehicles',
      '/admin/leads',
      '/admin/bookings',
      '/admin/sales-processing',
      '/admin/direct-sales',
      '/admin/cashier',
      '/admin/accessories',
      '/admin/reports',
      '/admin/settings',
    ],
    'Showroom Manager': [
      '/admin',
      '/admin/vehicles',
      '/admin/leads',
      '/admin/bookings',
      '/admin/sales-processing',
      '/admin/direct-sales',
      '/admin/accessories',
      '/admin/reports',
    ],
    'Sales Executive': [
      '/admin',
      '/admin/leads',
      '/admin/bookings',
      '/admin/direct-sales',
    ],
    'Accountant': [
      '/admin',
      '/admin/sales-processing',
      '/admin/reports',
    ],
    'Documentation Officer': [
      '/admin',
      '/admin/bookings',
      '/admin/sales-processing',
    ],
    'Cashier': [
      '/admin',
      '/admin/cashier',
    ],
    'Customer': [
      '/vehicles',
      '/book',
    ],
  };
  
  return routes[role] || [];
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true };
}

/**
 * Format session expiry time
 */
export function formatSessionExpiry(expiresAt: number): string {
  const now = Date.now() / 1000;
  const remaining = expiresAt - now;
  
  if (remaining <= 0) return 'Expired';
  
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}
