# Implementation Plan: Showroom Auth UX Improvement

## Overview

This implementation transforms the authentication experience from admin-centric to showroom-focused by updating messaging, terminology, UI components, and state management. The work is organized into discrete tasks that build incrementally, with property-based tests integrated throughout to validate correctness properties from the design document.

## Tasks

- [x] 1. Set up testing infrastructure and utilities
  - Install fast-check library for property-based testing
  - Create test utilities for role generation, user mocking, and viewport testing
  - Set up test data generators (roles, users, showrooms, emails, passwords, viewports)
  - _Requirements: All (testing foundation)_

- [ ] 2. Update LoginPage component with showroom-focused messaging
  - [x] 2.1 Replace primary heading with "Showroom Staff Login"
    - Update heading text from "Staff Portal Login" to "Showroom Staff Login"
    - Update subtitle from "Enter your organization credentials..." to "Access your showroom dashboard"
    - Add description text "Manage inquiries, bookings, and customers"
    - _Requirements: 1.1, 1.2, 1.3, 3.2, 3.3_
  
  - [x] 2.2 Remove demo account information from login form
    - Remove the blue demo account info box from the UI
    - Clean up any admin-centric terminology in remaining text
    - _Requirements: 1.4, 1.5_
  
  - [x] 2.3 Write property test for admin terminology exclusion
    - **Property 1: Admin Terminology Exclusion**
    - **Validates: Requirements 1.4**
  
  - [x] 2.4 Write unit tests for LoginPage messaging
    - Test heading displays "Showroom Staff Login"
    - Test subtitle displays "Access your showroom dashboard"
    - Test description displays "Manage inquiries, bookings, and customers"
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Implement password visibility toggle
  - [x] 3.1 Add password visibility state and toggle button
    - Add showPassword state to LoginPage component
    - Add Eye/EyeOff icon button to password input field
    - Toggle input type between "password" and "text" on click
    - _Requirements: 4.1_
  
  - [x] 3.2 Write property test for password visibility toggle
    - **Property 3: Password Visibility Toggle**
    - **Validates: Requirements 4.1**
  
  - [x] 3.3 Write unit tests for password toggle interaction
    - Test clicking toggle changes input type
    - Test icon changes between Eye and EyeOff
    - _Requirements: 4.1_

- [ ] 4. Enhance form validation and error handling
  - [ ] 4.1 Implement client-side form validation
    - Add email format validation with regex pattern
    - Add password minimum length validation (3 characters)
    - Add validationErrors state to track field-specific errors
    - Display inline validation messages below fields
    - _Requirements: 4.3_
  
  - [ ] 4.2 Improve error message display
    - Update error messages to be more descriptive and user-friendly
    - Add contextual help for different error types (invalid credentials, network error, unauthorized role)
    - Ensure error banner is clearly visible with proper styling
    - _Requirements: 4.2, 4.5_
  
  - [ ] 4.3 Add loading state improvements
    - Ensure submit button shows spinner during authentication
    - Disable submit button while isSubmitting is true
    - Prevent duplicate form submissions
    - _Requirements: 4.4_
  
  - [ ] 4.4 Write property test for form validation
    - **Property 4: Form Validation on Empty Submission**
    - **Validates: Requirements 4.3**
  
  - [ ] 4.5 Write property test for loading state
    - **Property 5: Loading State During Authentication**
    - **Validates: Requirements 4.4**
  
  - [ ] 4.6 Write property test for error feedback
    - **Property 6: Error Feedback Display**
    - **Validates: Requirements 4.2, 4.5**
  
  - [ ] 4.7 Write unit tests for validation scenarios
    - Test empty email shows validation error
    - Test empty password shows validation error
    - Test invalid email format shows validation error
    - Test password too short shows validation error
    - _Requirements: 4.3_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Create role display mapping system
  - [ ] 6.1 Add role display utilities to auth types
    - Create roleDisplayNames mapping in Code/frontend/src/types/auth.ts
    - Create roleContext mapping to categorize roles (System Level vs Showroom Staff)
    - Export utility functions getRoleDisplayName() and getRoleContext()
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [ ] 6.2 Write property test for role context display
    - **Property 2: Role Context Display**
    - **Validates: Requirements 2.3, 2.4, 2.5**
  
  - [ ] 6.3 Write unit tests for role display mapping
    - Test each role maps to correct display name
    - Test showroom staff roles map to "Showroom Staff" context
    - Test Super Admin maps to "System Administrator" display name
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 7. Enhance AuthContext with improved error handling
  - [ ] 7.1 Add structured error types to AuthContext
    - Create AuthError interface with code, message, and userMessage fields
    - Update AuthState to use AuthError instead of string
    - Update loginWithEmail to return structured errors
    - _Requirements: 4.2, 5.4_
  
  - [ ] 7.2 Implement role-based authentication filtering
    - Add check in loginWithEmail to reject Customer role
    - Return appropriate error for unauthorized roles
    - Ensure all showroom staff roles can authenticate
    - _Requirements: 5.1, 5.4_
  
  - [ ] 7.3 Write property test for showroom staff authentication
    - **Property 7: Showroom Staff Role Authentication**
    - **Validates: Requirements 5.1**
  
  - [ ] 7.4 Write property test for non-showroom user rejection
    - **Property 8: Non-Showroom User Rejection**
    - **Validates: Requirements 5.4**
  
  - [ ] 7.5 Write unit tests for AuthContext error handling
    - Test invalid credentials return appropriate error
    - Test Customer role returns unauthorized error
    - Test network errors are handled gracefully
    - _Requirements: 4.2, 5.4_

- [ ] 8. Update AdminLayout component terminology
  - [ ] 8.1 Replace "Admin Portal" with "Showroom Portal"
    - Update sidebar branding text from "Admin Portal" to "Showroom Portal"
    - Keep "OmniStream VMS" subtitle unchanged
    - _Requirements: 6.1, 6.2, 7.3_
  
  - [ ] 8.2 Enhance user profile display with role context
    - Update user profile section to show role context alongside specific role
    - Display format: "Showroom Staff - Manager" or "System Administrator"
    - Use getRoleContext() and getRoleDisplayName() utilities
    - _Requirements: 2.5, 7.1, 7.2_
  
  - [ ] 8.3 Write property test for dashboard context display
    - **Property 10: Dashboard Context Display**
    - **Validates: Requirements 7.1, 7.2**
  
  - [ ] 8.4 Write unit tests for AdminLayout terminology
    - Test sidebar displays "Showroom Portal"
    - Test user profile displays role with context
    - _Requirements: 6.2, 7.1, 7.2_

- [ ] 9. Improve ProtectedRoute component
  - [ ] 9.1 Add branded loading spinner
    - Replace generic spinner with showroom-branded loading state
    - Use showroom primary color for spinner
    - _Requirements: 9.4_
  
  - [ ] 9.2 Enhance redirect logic with return URL preservation
    - Ensure return URL is properly preserved in location state
    - Test redirect flow from protected route to login and back
    - _Requirements: 9.4_
  
  - [ ] 9.3 Write property test for protected route authentication check
    - **Property 16: Protected Route Authentication Check**
    - **Validates: Requirements 9.4**
  
  - [ ] 9.4 Write unit tests for ProtectedRoute behavior
    - Test unauthenticated user redirects to login
    - Test return URL is preserved in state
    - Test authenticated user can access protected route
    - _Requirements: 9.4_

- [ ] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Implement session management enhancements
  - [ ] 11.1 Add session persistence configuration
    - Add SessionConfig interface to AuthContext
    - Implement session timeout tracking
    - Add refreshSession() method to validate and refresh auth state
    - _Requirements: 9.1, 9.2_
  
  - [ ] 11.2 Implement session expiration handling
    - Add session expiration check in AuthContext
    - Redirect to login with "session expired" message when expired
    - Clear authentication state on expiration
    - _Requirements: 9.5_
  
  - [ ] 11.3 Write property test for authentication state persistence
    - **Property 14: Authentication State Persistence**
    - **Validates: Requirements 9.1, 9.2**
  
  - [ ] 11.4 Write property test for logout state clearing
    - **Property 15: Logout State Clearing**
    - **Validates: Requirements 9.3**
  
  - [ ] 11.5 Write property test for session expiration redirect
    - **Property 17: Session Expiration Redirect**
    - **Validates: Requirements 9.5**
  
  - [ ] 11.6 Write unit tests for session management
    - Test successful login stores auth state
    - Test logout clears localStorage
    - Test session persists across page refresh
    - Test expired session redirects to login
    - _Requirements: 9.1, 9.2, 9.3, 9.5_

- [ ] 12. Implement responsive design improvements
  - [ ] 12.1 Optimize LoginPage layout for all viewport sizes
    - Ensure vertical stacking on mobile (320px - 767px)
    - Optimize layout for tablet (768px - 1023px)
    - Ensure horizontal layout on desktop (1024px+)
    - Test touch targets are minimum 44x44px on mobile
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ] 12.2 Write property test for responsive layout adaptation
    - **Property 18: Responsive Layout Adaptation**
    - **Validates: Requirements 10.1, 10.2, 10.3**
  
  - [ ] 12.3 Write unit tests for responsive breakpoints
    - Test layout at 320px width (mobile)
    - Test layout at 768px width (tablet)
    - Test layout at 1024px width (desktop)
    - Test layout at 1920px width (large desktop)
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 13. Integrate showroom branding into LoginPage
  - [ ] 13.1 Add dynamic showroom branding
    - Use ShowroomContext to get active showroom
    - Apply showroom primary color to branding section background
    - Display showroom name in branding section
    - Display showroom logo if available
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 13.2 Write property test for brand color application
    - **Property 12: Brand Color Application**
    - **Validates: Requirements 8.2**
  
  - [ ] 13.3 Write property test for showroom name display
    - **Property 13: Showroom Name Display**
    - **Validates: Requirements 8.4**
  
  - [ ] 13.4 Write unit tests for branding integration
    - Test showroom name displays correctly
    - Test primary color is applied to branding section
    - Test branding section is visible on desktop
    - _Requirements: 8.1, 8.2, 8.4_

- [ ] 14. Add route backward compatibility
  - [ ] 14.1 Maintain /admin route compatibility
    - Ensure existing /admin routes continue to work
    - Add route aliases if needed for transition period
    - Document route migration path for future updates
    - _Requirements: 6.3_
  
  - [ ] 14.2 Write property test for route backward compatibility
    - **Property 9: Route Backward Compatibility**
    - **Validates: Requirements 6.3**
  
  - [ ] 14.3 Write unit tests for route compatibility
    - Test /admin route is accessible
    - Test navigation to /admin works correctly
    - _Requirements: 6.3_

- [ ] 15. Implement super admin options filtering
  - [ ] 15.1 Add role-based UI filtering in AdminLayout
    - Hide system-level options from showroom staff users
    - Show full navigation only to Super Admin role
    - Ensure showroom staff see only relevant modules
    - _Requirements: 7.4_
  
  - [ ] 15.2 Write property test for super admin options exclusion
    - **Property 11: Super Admin Options Exclusion**
    - **Validates: Requirements 7.4**
  
  - [ ] 15.3 Write unit tests for role-based UI filtering
    - Test Super Admin sees all navigation items
    - Test Showroom Manager sees filtered navigation
    - Test system-level options hidden from showroom staff
    - _Requirements: 7.4_

- [ ] 16. Final checkpoint and integration testing
  - [ ] 16.1 Run full test suite
    - Execute all unit tests and verify 90%+ coverage
    - Execute all property-based tests with 100+ iterations each
    - Fix any failing tests
    - _Requirements: All_
  
  - [ ] 16.2 Perform manual testing checklist
    - Test complete login flow on mobile, tablet, and desktop
    - Verify all messaging changes are visible
    - Test password visibility toggle
    - Test form validation with various inputs
    - Test error handling for different scenarios
    - Verify role display in dashboard
    - Test logout and session persistence
    - _Requirements: All_
  
  - [ ] 16.3 Verify accessibility compliance
    - Test keyboard navigation (Tab, Enter, Escape)
    - Verify focus indicators are visible
    - Test with screen reader (basic check)
    - Verify color contrast meets WCAG AA
    - Ensure touch targets are 44x44px minimum on mobile
    - _Requirements: 10.1, 10.2, 10.3_

- [ ] 17. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation maintains backward compatibility with existing routes and authentication mechanisms
- All changes preserve the existing authentication security model
