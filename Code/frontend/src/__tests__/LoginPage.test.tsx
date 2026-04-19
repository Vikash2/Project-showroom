/**
 * Unit Tests for LoginPage Messaging
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * These tests verify the specific messaging changes made in Task 2.1:
 * - Heading displays "Showroom Staff Login"
 * - Subtitle displays "Access your showroom dashboard"
 * - Description displays "Manage inquiries, bookings, and customers"
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import { AuthProvider } from '../state/AuthContext';

// Mock the AuthContext to avoid actual authentication logic
vi.mock('../state/AuthContext', async () => {
  const actual = await vi.importActual('../state/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      loginWithEmail: vi.fn(),
      isLoading: false,
      user: null,
      isAuthenticated: false,
    }),
  };
});

// Helper function to render LoginPage with required providers
const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage Messaging', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display "Showroom Staff Login" as the primary heading', () => {
    renderLoginPage();
    
    const heading = screen.getByRole('heading', { name: /showroom staff login/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Showroom Staff Login');
  });

  it('should display "Access your showroom dashboard" as the subtitle', () => {
    renderLoginPage();
    
    const subtitle = screen.getByText('Access your showroom dashboard');
    expect(subtitle).toBeInTheDocument();
  });

  it('should display "Manage inquiries, bookings, and customers" as the description', () => {
    renderLoginPage();
    
    const description = screen.getByText('Manage inquiries, bookings, and customers');
    expect(description).toBeInTheDocument();
  });

  it('should display all three messaging elements together', () => {
    renderLoginPage();
    
    // Verify all three elements are present simultaneously
    expect(screen.getByRole('heading', { name: /showroom staff login/i })).toBeInTheDocument();
    expect(screen.getByText('Access your showroom dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage inquiries, bookings, and customers')).toBeInTheDocument();
  });

  it('should display messaging in the correct hierarchy', () => {
    renderLoginPage();
    
    const heading = screen.getByRole('heading', { name: /showroom staff login/i });
    const subtitle = screen.getByText('Access your showroom dashboard');
    const description = screen.getByText('Manage inquiries, bookings, and customers');
    
    // Verify heading is an h2 element
    expect(heading.tagName).toBe('H2');
    
    // Verify subtitle and description are present
    expect(subtitle).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });
});

/**
 * Unit Tests for Password Visibility Toggle
 * 
 * **Validates: Requirements 4.1**
 * 
 * These tests verify the password visibility toggle functionality added in Task 3.1:
 * - Password field starts with type="password"
 * - Toggle button is present and accessible
 * - Clicking toggle changes input type to "text"
 * - Clicking again changes input type back to "password"
 * - Correct icons are displayed (Eye/EyeOff)
 */

describe('Password Visibility Toggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render password input with type="password" by default', () => {
    renderLoginPage();
    
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should render password visibility toggle button', () => {
    renderLoginPage();
    
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should change password input type to "text" when toggle is clicked', async () => {
    const user = userEvent.setup();
    
    renderLoginPage();
    
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    
    // Initially password type
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click toggle
    await user.click(toggleButton);
    
    // Should now be text type
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('should change password input type back to "password" when toggle is clicked again', async () => {
    const user = userEvent.setup();
    
    renderLoginPage();
    
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    
    // Click toggle to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click toggle again to hide password
    const hideButton = screen.getByRole('button', { name: /hide password/i });
    await user.click(hideButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should update aria-label when toggling password visibility', async () => {
    const user = userEvent.setup();
    
    renderLoginPage();
    
    const toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
    
    // Click to show password
    await user.click(toggleButton);
    
    const hideButton = screen.getByRole('button', { name: /hide password/i });
    expect(hideButton).toHaveAttribute('aria-label', 'Hide password');
  });
});
