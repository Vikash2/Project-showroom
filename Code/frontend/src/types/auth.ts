export type Role = 
  | 'Super Admin'
  | 'Showroom Manager'
  | 'Sales Executive'
  | 'Accountant'
  | 'Documentation Officer'
  | 'Customer';

export interface User {
  id: string;
  fullName: string;
  email?: string;
  mobile: string;
  role: Role;
  showroomId?: string; // e.g. "SH001" for Sandhya Honda, null if Super Admin or Customer
  profileImage?: string;
}

export const roleDisplayNames: Record<Role, string> = {
    'Super Admin': 'System Administrator',
    'Showroom Manager': 'Showroom Manager',
    'Sales Executive': 'Sales Consultant',
    'Accountant': 'Accounts Officer',
    'Documentation Officer': 'Records Officer',
    'Customer': 'Customer'
};

export const roleContext: Record<Role, 'System' | 'Showroom Staff' | 'Public'> = {
    'Super Admin': 'System',
    'Showroom Manager': 'Showroom Staff',
    'Sales Executive': 'Showroom Staff',
    'Accountant': 'Showroom Staff',
    'Documentation Officer': 'Showroom Staff',
    'Customer': 'Public'
};

export interface AuthError {
    code: string;
    message: string;
    userMessage: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
}
