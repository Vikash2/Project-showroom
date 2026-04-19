/**
 * Property-Based Tests for Login Page Terminology
 * Feature: showroom-auth-ux-improvement
 * 
 * These tests verify that the LoginPage component maintains proper
 * showroom-focused terminology and excludes admin-centric language.
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import LoginPage from '../../pages/auth/LoginPage';
import { AuthProvider } from '../../state/AuthContext';

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

describe('Login Page Terminology Properties', () => {
  /**
   * Property 1: Admin Terminology Exclusion
   * **Validates: Requirements 1.4**
   * 
   * For any rendered LoginPage component, the visible text content should not
   * contain admin-centric terms such as "admin", "administrator", or "admin portal"
   * (case-insensitive).
   */
  describe('Property 1: Admin Terminology Exclusion', () => {
    it('should not contain admin-centric terminology in any render state', () => {
      // Property: The LoginPage should never display admin-centric terminology
      // This property runs 100 times to ensure consistency
      
      fc.assert(
        fc.property(
          fc.constant(null), // Dummy generator to run the test 100 times
          () => {
            // Render the LoginPage
            const { container } = renderLoginPage();

            // Get all visible text content from the rendered component
            const textContent = container.textContent || '';

            // Define admin-centric terms that should NOT appear
            const adminTerms = [
              /\badmin\b/i,           // "admin" as a whole word
              /\badministrator\b/i,   // "administrator" as a whole word
              /admin\s+portal/i,      // "admin portal"
              /admin\s+login/i,       // "admin login"
              /admin\s+dashboard/i,   // "admin dashboard"
              /admin\s+panel/i,       // "admin panel"
            ];

            // Verify none of the admin terms appear in the text content
            for (const term of adminTerms) {
              const match = textContent.match(term);
              if (match) {
                // If we find an admin term, the property fails
                console.error(`Found admin-centric term: "${match[0]}" in text content`);
                return false;
              }
            }

            // Property holds: no admin-centric terminology found
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use showroom-focused terminology instead', () => {
      // Additional verification: ensure showroom-focused terms ARE present
      const { container } = renderLoginPage();
      const textContent = container.textContent || '';

      // These showroom-focused terms SHOULD be present
      expect(textContent).toMatch(/showroom/i);
      expect(textContent).toMatch(/staff/i);
    });

    it('should maintain terminology exclusion across all text elements', () => {
      // Property: Admin terminology should not appear in any specific UI element
      const { container } = renderLoginPage();

      // Check headings
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headings.forEach(heading => {
        const text = heading.textContent || '';
        expect(text.toLowerCase()).not.toMatch(/\badmin\b/);
        expect(text.toLowerCase()).not.toMatch(/\badministrator\b/);
      });

      // Check labels
      const labels = container.querySelectorAll('label');
      labels.forEach(label => {
        const text = label.textContent || '';
        expect(text.toLowerCase()).not.toMatch(/\badmin\b/);
        expect(text.toLowerCase()).not.toMatch(/\badministrator\b/);
      });

      // Check buttons
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        const text = button.textContent || '';
        expect(text.toLowerCase()).not.toMatch(/\badmin\b/);
        expect(text.toLowerCase()).not.toMatch(/\badministrator\b/);
      });

      // Check paragraphs
      const paragraphs = container.querySelectorAll('p');
      paragraphs.forEach(p => {
        const text = p.textContent || '';
        expect(text.toLowerCase()).not.toMatch(/\badmin\b/);
        expect(text.toLowerCase()).not.toMatch(/\badministrator\b/);
      });
    });
  });
});
