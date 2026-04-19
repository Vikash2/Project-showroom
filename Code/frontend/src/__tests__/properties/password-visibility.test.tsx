/**
 * Property-Based Tests for Password Visibility Toggle
 * Feature: showroom-auth-ux-improvement
 * 
 * These tests verify that the password visibility toggle works correctly
 * across all input states.
 */

import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';
import LoginPage from '../../pages/auth/LoginPage';
import { AuthProvider } from '../../state/AuthContext';
import { passwordGenerator } from '../utils/generators';

/**
 * Helper function to render LoginPage with necessary providers
 */
function renderLoginPage() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Password Visibility Toggle Properties', () => {
  /**
   * Property 3: Password Visibility Toggle
   * **Validates: Requirements 4.1**
   * 
   * For any password input field with a visibility toggle, clicking the toggle
   * should change the input type between "password" and "text", making characters
   * visible or hidden accordingly.
   */
  describe('Property 3: Password Visibility Toggle', () => {
    it('should toggle password visibility for any password input state', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordGenerator.filter(p => p.trim().length > 0), // Filter out whitespace-only passwords
          async (password) => {
            // Setup user event
            const user = userEvent.setup();

            // Render the LoginPage
            const { container, unmount } = renderLoginPage();

            // Find the password input field by label
            const passwordInput = container.querySelector('input[type="password"][placeholder="••••••••"]') as HTMLInputElement;
            expect(passwordInput).toBeTruthy();

            // Find the toggle button by its aria-label
            const toggleButton = container.querySelector('button[aria-label*="password"]') as HTMLButtonElement;
            expect(toggleButton).toBeTruthy();

            // Set the password value using fireEvent (more reliable than userEvent for this)
            fireEvent.change(passwordInput, { target: { value: password } });

            // Initial state: password should be hidden (type="password")
            expect(passwordInput.type).toBe('password');
            expect(passwordInput.value).toBe(password);

            // Click the toggle button to show password
            await user.click(toggleButton);

            // After first click: password should be visible (type="text")
            expect(passwordInput.type).toBe('text');
            expect(passwordInput.value).toBe(password);

            // Click the toggle button again to hide password
            await user.click(toggleButton);

            // After second click: password should be hidden again (type="password")
            expect(passwordInput.type).toBe('password');
            expect(passwordInput.value).toBe(password);

            // Clean up after each iteration
            unmount();

            // Property holds: toggle works correctly for this password
            return true;
          }
        ),
        { numRuns: 50, timeout: 10000 }
      );
    }, 15000);

    it('should maintain password value when toggling visibility', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordGenerator.filter(p => p.trim().length > 0),
          async (password) => {
            const user = userEvent.setup();
            const { container, unmount } = renderLoginPage();

            const passwordInput = container.querySelector('input[type="password"][placeholder="••••••••"]') as HTMLInputElement;
            const toggleButton = container.querySelector('button[aria-label*="password"]') as HTMLButtonElement;

            // Set password using fireEvent
            fireEvent.change(passwordInput, { target: { value: password } });

            const originalValue = passwordInput.value;

            // Toggle visibility multiple times
            await user.click(toggleButton); // Show
            expect(passwordInput.value).toBe(originalValue);

            await user.click(toggleButton); // Hide
            expect(passwordInput.value).toBe(originalValue);

            await user.click(toggleButton); // Show again
            expect(passwordInput.value).toBe(originalValue);

            // Clean up
            unmount();

            // Property holds: value never changes during toggle
            return true;
          }
        ),
        { numRuns: 50, timeout: 10000 }
      );
    }, 15000);

    it('should update toggle button aria-label based on visibility state', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordGenerator.filter(p => p.trim().length > 0),
          async (password) => {
            const user = userEvent.setup();
            const { container, unmount } = renderLoginPage();

            const passwordInput = container.querySelector('input[placeholder="••••••••"]') as HTMLInputElement;

            // Set password using fireEvent
            fireEvent.change(passwordInput, { target: { value: password } });

            // Initial state: password hidden, button should say "Show password"
            let toggleButton = container.querySelector('button[aria-label="Show password"]') as HTMLButtonElement;
            expect(toggleButton).toBeTruthy();

            // Click to show password
            await user.click(toggleButton);

            // After showing: button should say "Hide password"
            toggleButton = container.querySelector('button[aria-label="Hide password"]') as HTMLButtonElement;
            expect(toggleButton).toBeTruthy();

            // Click to hide password
            await user.click(toggleButton);

            // After hiding: button should say "Show password" again
            toggleButton = container.querySelector('button[aria-label="Show password"]') as HTMLButtonElement;
            expect(toggleButton).toBeTruthy();

            // Clean up
            unmount();

            // Property holds: aria-label updates correctly
            return true;
          }
        ),
        { numRuns: 50, timeout: 10000 }
      );
    }, 15000);

    it('should work with empty password field', async () => {
      const user = userEvent.setup();
      const { container } = renderLoginPage();

      const passwordInput = container.querySelector('input[placeholder="••••••••"]') as HTMLInputElement;
      const toggleButton = container.querySelector('button[aria-label*="password"]') as HTMLButtonElement;

      // Clear the password field (it has default value)
      await user.clear(passwordInput);

      // Initial state with empty password
      expect(passwordInput.type).toBe('password');
      expect(passwordInput.value).toBe('');

      // Toggle should still work with empty field
      await user.click(toggleButton);
      expect(passwordInput.type).toBe('text');
      expect(passwordInput.value).toBe('');

      await user.click(toggleButton);
      expect(passwordInput.type).toBe('password');
      expect(passwordInput.value).toBe('');
    });

    it('should toggle visibility independently of form submission state', async () => {
      await fc.assert(
        fc.asyncProperty(
          passwordGenerator.filter(p => p.trim().length > 0),
          async (password) => {
            const user = userEvent.setup();
            const { container, unmount } = renderLoginPage();

            const passwordInput = container.querySelector('input[placeholder="••••••••"]') as HTMLInputElement;
            const toggleButton = container.querySelector('button[aria-label*="password"]') as HTMLButtonElement;

            // Set password using fireEvent
            fireEvent.change(passwordInput, { target: { value: password } });

            // Toggle before any form interaction
            await user.click(toggleButton);
            expect(passwordInput.type).toBe('text');

            // Toggle back
            await user.click(toggleButton);
            expect(passwordInput.type).toBe('password');

            // Clean up
            unmount();

            // Property holds: toggle works independently
            return true;
          }
        ),
        { numRuns: 50, timeout: 10000 }
      );
    }, 15000);
  });
});
