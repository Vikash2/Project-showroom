/**
 * User Mocking Utilities
 * 
 * Provides utilities for creating mock users and authentication contexts
 * for testing purposes.
 */

import type { User, Role } from '../../types/auth';

/**
 * Create a mock user with specified role and optional overrides
 */
export function createMockUser(role: Role, overrides?: Partial<User>): User {
  const baseUser: User = {
    id: 'test-user-id',
    fullName: 'Test User',
    email: 'test@example.com',
    mobile: '9876543210',
    role,
    showroomId: role !== 'Customer' && role !== 'Super Admin' ? 'SH001' : undefined,
    profileImage: undefined,
  };

  return { ...baseUser, ...overrides };
}

/**
 * Create a mock showroom manager user
 */
export function createMockShowroomManager(overrides?: Partial<User>): User {
  return createMockUser('Showroom Manager', {
    fullName: 'John Manager',
    email: 'manager@showroom.com',
    ...overrides,
  });
}

/**
 * Create a mock sales executive user
 */
export function createMockSalesExecutive(overrides?: Partial<User>): User {
  return createMockUser('Sales Executive', {
    fullName: 'Jane Sales',
    email: 'sales@showroom.com',
    ...overrides,
  });
}

/**
 * Create a mock accountant user
 */
export function createMockAccountant(overrides?: Partial<User>): User {
  return createMockUser('Accountant', {
    fullName: 'Bob Accountant',
    email: 'accountant@showroom.com',
    ...overrides,
  });
}

/**
 * Create a mock documentation officer user
 */
export function createMockDocumentationOfficer(overrides?: Partial<User>): User {
  return createMockUser('Documentation Officer', {
    fullName: 'Alice Documentation',
    email: 'docs@showroom.com',
    ...overrides,
  });
}

/**
 * Create a mock super admin user
 */
export function createMockSuperAdmin(overrides?: Partial<User>): User {
  return createMockUser('Super Admin', {
    fullName: 'Super Admin',
    email: 'admin@system.com',
    showroomId: undefined,
    ...overrides,
  });
}

/**
 * Create a mock customer user
 */
export function createMockCustomer(overrides?: Partial<User>): User {
  return createMockUser('Customer', {
    fullName: 'Customer User',
    email: 'customer@example.com',
    showroomId: undefined,
    ...overrides,
  });
}

/**
 * Get all showroom staff roles
 */
export function getShowroomStaffRoles(): Role[] {
  return ['Super Admin', 'Showroom Manager', 'Sales Executive', 'Accountant', 'Documentation Officer'];
}

/**
 * Check if a role is a showroom staff role
 */
export function isShowroomStaffRole(role: Role): boolean {
  return getShowroomStaffRoles().includes(role);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    'Super Admin': 'System Administrator',
    'Showroom Manager': 'Showroom Manager',
    'Sales Executive': 'Sales Executive',
    'Accountant': 'Accountant',
    'Documentation Officer': 'Documentation Officer',
    'Cashier': 'Cashier',
    'Customer': 'Customer',
  };
  return displayNames[role];
}

/**
 * Get role context (System Level vs Showroom Staff)
 */
export function getRoleContext(role: Role): string {
  if (role === 'Super Admin') {
    return 'System Level';
  } else if (role === 'Customer') {
    return 'Customer';
  } else {
    return 'Showroom Staff';
  }
}
