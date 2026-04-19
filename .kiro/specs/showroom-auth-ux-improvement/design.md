# Design Document: Showroom Auth UX Improvement

## Overview

This design transforms the authentication experience from admin-centric to showroom-focused, improving clarity and usability for showroom staff. The current implementation uses ambiguous "Admin" terminology and mixed messaging that confuses users about the system's purpose. This enhancement creates a cohesive, professional authentication flow with clear showroom context, proper role naming, and modern UI patterns.

The design addresses 10 key requirements spanning messaging, terminology, UI design, usability, access control, naming consistency, dashboard context, branding, state management, and responsive design. The solution maintains backward compatibility while introducing progressive enhancements to the authentication system.

### Key Design Goals

- Replace admin-centric terminology with showroom-focused language throughout the authentication flow
- Create a professional, branded login experience that reflects showroom identity
- Implement modern form usability patterns (password visibility, validation, loading states)
- Ensure responsive design across all device sizes
- Maintain secure authentication while improving user experience
- Establish consistent naming conventions across components and routes

## Architecture

### System Components

The authentication system consists of three primary layers:

**Presentation Layer**
- `LoginPage` component: User-facing login interface
- `ProtectedRoute` component: Route-level access control
- `AdminLayout` component: Post-authentication dashboard layout

**State Management Layer**
- `AuthContext`: Global authentication state provider
- `AuthState`: Type-safe authentication state interface
- Local storage: Session persistence mechanism

**Type System Layer**
- `Role` type: User role definitions
- `User` interface: User data structure
- `AuthState` interface: Authentication state structure

### Authentication Flow

```
User Access → LoginPage → AuthContext.loginWithEmail() → 
  → Credential Validation → Session Creation → 
  → ProtectedRoute Check → Dashboard Redirect
```

### Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── LoginPage (Public)
│   └── ProtectedRoute (Guard)
│       └── AdminLayout (Protected)
│           └── Dashboard Components
```

## Components and Interfaces

### LoginPage Component Redesign

**File**: `Code/frontend/src/pages/auth/LoginPage.tsx`

**Current Issues**:
- Mixed messaging ("Staff Portal Login" vs "Admin")
- Demo account information clutters the interface
- Inconsistent terminology
- Limited form validation feedback
- No password visibility toggle

**Design Changes**:

1. **Messaging Hierarchy**
   - Primary heading: "Showroom Staff Login"
   - Subtitle: "Access your showroom dashboard"
   - Description: "Manage inquiries, bookings, and customers"

2. **Form Structure**
   ```typescript
   interface LoginFormState {
     email: string;
     password: string;
     showPassword: boolean;
     isSubmitting: boolean;
     validationErrors: {
       email?: string;
       password?: string;
     };
   }
   ```

3. **UI Components**
   - Email input with icon and validation
   - Password input with visibility toggle
   - Loading state button
   - Error message display with contextual help
   - Forgot password link (styled but non-functional for now)

4. **Branding Section**
   - Left panel: Showroom branding with gradient overlay
   - Showroom name and tagline
   - Feature highlights (Staff Access, Secure Access)
   - Dynamic primary color from showroom context

### Role Type System Updates

**File**: `Code/frontend/src/types/auth.ts`

**Current Implementation**:
```typescript
export type Role = 
  | 'Super Admin'
  | 'Showroom Manager'
  | 'Sales Executive'
  | 'Accountant'
  | 'Documentation Officer'
  | 'Customer';
```

**Design Decision**: Keep role types unchanged in the type system to maintain data integrity. The "Super Admin" role represents system-level access distinct from showroom staff. UI presentation will handle the display terminology.

**Display Mapping**:
```typescript
const roleDisplayNames: Record<Role, string> = {
  'Super Admin': 'System Administrator',
  'Showroom Manager': 'Showroom Manager',
  'Sales Executive': 'Sales Executive',
  'Accountant': 'Accountant',
  'Documentation Officer': 'Documentation Officer',
  'Customer': 'Customer'
};

const roleContext: Record<Role, string> = {
  'Super Admin': 'System Level',
  'Showroom Manager': 'Showroom Staff',
  'Sales Executive': 'Showroom Staff',
  'Accountant': 'Showroom Staff',
  'Documentation Officer': 'Showroom Staff',
  'Customer': 'Customer'
};
```

### AuthContext Enhancements

**File**: `Code/frontend/src/state/AuthContext.tsx`

**Current Capabilities**:
- Email/password authentication
- Session persistence via localStorage
- Role-based access control
- Loading state management

**Design Enhancements**:

1. **Enhanced Error Handling**
   ```typescript
   interface AuthError {
     code: 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' | 'UNAUTHORIZED_ROLE';
     message: string;
     userMessage: string; // User-friendly message
   }
   ```

2. **Session Management**
   ```typescript
   interface SessionConfig {
     persistSession: boolean;
     sessionTimeout: number; // milliseconds
     refreshInterval: number;
   }
   ```

3. **Authentication Methods**
   - `loginWithEmail(email, password)`: Existing method with enhanced validation
   - `logout()`: Clear session and redirect
   - `refreshSession()`: Validate and refresh authentication state
   - `hasRole(allowedRoles)`: Role-based access check

### ProtectedRoute Component

**File**: `Code/frontend/src/components/auth/ProtectedRoute.tsx`

**Current Implementation**: Functional and secure

**Design Enhancements**:
- Add loading state with branded spinner
- Improve redirect logic with return URL preservation
- Add role-specific redirect destinations
- Enhanced error boundary for auth failures

### AdminLayout Component Updates

**File**: `Code/frontend/src/components/admin/AdminLayout.tsx`

**Terminology Updates**:
- Sidebar branding: "Showroom Portal" instead of "Admin Portal"
- User profile display: Show role context ("Showroom Staff - Manager")
- Navigation labels: Maintain current labels (already showroom-focused)

**Dashboard Context Display**:
```typescript
interface DashboardHeader {
  showroomName: string;
  showroomLogo: string;
  userRole: string;
  roleContext: string; // "Showroom Staff"
}
```

## Data Models

### User Model

```typescript
export interface User {
  id: string;
  fullName: string;
  email?: string;
  mobile: string;
  role: Role;
  showroomId?: string;
  profileImage?: string;
  metadata?: {
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
  };
}
```

### Authentication State Model

```typescript
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  session: {
    token?: string;
    expiresAt?: Date;
    refreshToken?: string;
  } | null;
}
```

### Login Form Validation Model

```typescript
interface ValidationRules {
  email: {
    required: boolean;
    pattern: RegExp;
    message: string;
  };
  password: {
    required: boolean;
    minLength: number;
    message: string;
  };
}

const loginValidation: ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 3,
    message: 'Password must be at least 3 characters'
  }
};
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies and consolidation opportunities:

**Redundancy Analysis**:

1. **Role Display Properties (2.3, 2.4, 2.5)**: These three properties all test that showroom staff roles display appropriate terminology. They can be consolidated into a single comprehensive property that verifies role display across all UI contexts.

2. **Login Page Text Properties (1.1, 1.2, 1.3, 3.2, 3.3)**: These are all testing for specific text strings in the login page. Since they're testing specific examples rather than general properties, they should be handled as unit test examples, not properties.

3. **Error Display Properties (4.2, 4.5)**: Both test error message display under different conditions. These can be combined into one property about error feedback.

4. **Dashboard Display Properties (7.1, 7.2)**: Both test that dashboard displays user/showroom context. Can be combined into one property about context display.

5. **Responsive Layout Properties (10.1, 10.2, 10.3)**: These all test responsive behavior at different breakpoints. Can be consolidated into one property about responsive adaptation.

**Consolidated Properties**:
- Combine 2.3, 2.4, 2.5 → Single property: "Role context display"
- Combine 4.2, 4.5 → Single property: "Error feedback display"
- Combine 7.1, 7.2 → Single property: "Dashboard context display"
- Combine 10.1, 10.2, 10.3 → Single property: "Responsive layout adaptation"

### Property 1: Admin Terminology Exclusion

*For any* rendered LoginPage component, the visible text content should not contain admin-centric terms such as "admin", "administrator", or "admin portal" (case-insensitive).

**Validates: Requirements 1.4**

### Property 2: Role Context Display

*For any* user with a showroom staff role (Showroom Manager, Sales Executive, Accountant, Documentation Officer), the UI components should display "Showroom Staff" as the role context alongside the specific sub-role.

**Validates: Requirements 2.3, 2.4, 2.5**

### Property 3: Password Visibility Toggle

*For any* password input field with a visibility toggle, clicking the toggle should change the input type between "password" and "text", making characters visible or hidden accordingly.

**Validates: Requirements 4.1**

### Property 4: Form Validation on Empty Submission

*For any* combination of empty form fields (email, password, or both), submitting the login form should display field-specific validation messages and prevent form submission.

**Validates: Requirements 4.3**

### Property 5: Loading State During Authentication

*For any* login attempt, while the authentication request is processing, the submit button should display a loading state and be disabled to prevent duplicate submissions.

**Validates: Requirements 4.4**

### Property 6: Error Feedback Display

*For any* authentication error (invalid credentials, network error, unauthorized role), the system should display a descriptive error message with contextual information to help the user resolve the issue.

**Validates: Requirements 4.2, 4.5**

### Property 7: Showroom Staff Role Authentication

*For any* user with a showroom staff role (Showroom Manager, Sales Executive, Accountant, Documentation Officer, Super Admin), authentication should succeed when valid credentials are provided.

**Validates: Requirements 5.1**

### Property 8: Non-Showroom User Rejection

*For any* user with a Customer role, authentication attempts should fail with an appropriate error message indicating the login is for showroom staff only.

**Validates: Requirements 5.4**

### Property 9: Route Backward Compatibility

*For any* legacy "/admin" route path, the system should maintain access during the transition period, ensuring existing bookmarks and links continue to function.

**Validates: Requirements 6.3**

### Property 10: Dashboard Context Display

*For any* authenticated showroom staff user, the dashboard should display both the showroom name and the user's specific role prominently in the interface.

**Validates: Requirements 7.1, 7.2**

### Property 11: Super Admin Options Exclusion

*For any* user with a showroom staff role (excluding Super Admin), the dashboard should not display system-level or super admin options in the navigation or interface.

**Validates: Requirements 7.4**

### Property 12: Brand Color Application

*For any* active showroom context, the login page should apply the showroom's primary brand color to key UI elements (branding section, buttons, accents).

**Validates: Requirements 8.2**

### Property 13: Showroom Name Display

*For any* active showroom, the login page should display the showroom's name in the branding section.

**Validates: Requirements 8.4**

### Property 14: Authentication State Persistence

*For any* successful login, the authentication context should store the user state and maintain it across page refreshes based on the session configuration.

**Validates: Requirements 9.1, 9.2**

### Property 15: Logout State Clearing

*For any* authenticated user, invoking the logout function should immediately clear all authentication state from the context and local storage.

**Validates: Requirements 9.3**

### Property 16: Protected Route Authentication Check

*For any* navigation to a protected route, the system should verify authentication status and redirect unauthenticated users to the login page with the return URL preserved.

**Validates: Requirements 9.4**

### Property 17: Session Expiration Redirect

*For any* expired authentication session, attempting to access protected routes should redirect the user to the login page with an appropriate session expired message.

**Validates: Requirements 9.5**

### Property 18: Responsive Layout Adaptation

*For any* viewport width between 320px and 2560px, the login page should render without horizontal scrolling and adapt its layout appropriately (vertical stacking on mobile, optimized layout on tablet, horizontal layout on desktop).

**Validates: Requirements 10.1, 10.2, 10.3**


## Error Handling

### Client-Side Validation Errors

**Empty Field Validation**
- Trigger: User submits form with empty email or password
- Handling: Display inline validation message below the field
- Message: "Email is required" or "Password is required"
- UI State: Highlight field with red border, show error icon

**Invalid Email Format**
- Trigger: User enters malformed email address
- Handling: Validate on blur and on submit
- Message: "Please enter a valid email address"
- Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Password Length Validation**
- Trigger: User enters password shorter than minimum length
- Handling: Validate on submit
- Message: "Password must be at least 3 characters"
- Minimum: 3 characters (current implementation)

### Authentication Errors

**Invalid Credentials**
- Trigger: Email/password combination not found or incorrect
- Handling: Display error banner above form
- Message: "Invalid email or password. Please check your credentials and try again."
- UI State: Red error banner with alert icon, form remains populated

**Unauthorized Role**
- Trigger: User has Customer role attempting showroom staff login
- Handling: Display error banner with specific message
- Message: "This login is for showroom staff only. Customers should access the main website."
- Action: Clear form, suggest alternative

**Network Errors**
- Trigger: Network request fails or times out
- Handling: Display error banner with retry option
- Message: "Unable to connect. Please check your internet connection and try again."
- Action: Provide retry button

**Session Expired**
- Trigger: User's session expires while using the system
- Handling: Redirect to login with message
- Message: "Your session has expired. Please log in again."
- State: Preserve intended destination for post-login redirect

### System Errors

**Context Provider Missing**
- Trigger: Component used outside AuthProvider
- Handling: Throw error with clear message
- Message: "useAuth must be used within an AuthProvider"
- Prevention: Ensure App.tsx wraps routes with AuthProvider

**Showroom Context Missing**
- Trigger: Login page rendered without ShowroomProvider
- Handling: Fallback to default showroom or show error
- Message: "Unable to load showroom information"
- Fallback: Use default showroom configuration

### Error Recovery Strategies

**Automatic Retry**
- Network errors: Implement exponential backoff for retries
- Max retries: 3 attempts
- Backoff: 1s, 2s, 4s

**State Recovery**
- Preserve form input on validation errors
- Clear sensitive data (password) on authentication errors
- Maintain return URL through error states

**User Guidance**
- Provide actionable error messages
- Include "Forgot Password?" link for credential issues
- Show contact information for persistent problems

### Error Logging

**Client-Side Logging**
```typescript
interface ErrorLog {
  timestamp: Date;
  errorType: 'validation' | 'authentication' | 'network' | 'system';
  errorCode: string;
  message: string;
  context: {
    component: string;
    userAction: string;
    additionalData?: Record<string, unknown>;
  };
}
```

**Privacy Considerations**
- Never log passwords or sensitive credentials
- Sanitize email addresses in logs (show domain only)
- Log error patterns for debugging without exposing PII

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Specific text content verification (e.g., "Showroom Staff Login" heading)
- Component rendering with specific props
- User interaction flows (click, type, submit)
- Edge cases (empty states, specific error conditions)
- Integration between components (LoginPage → AuthContext → ProtectedRoute)

**Property-Based Tests**: Verify universal properties across all inputs
- Form validation across random input combinations
- Role-based access control across all role types
- Responsive behavior across random viewport sizes
- Error handling across various error conditions
- State management across different user flows

### Testing Framework Selection

**Unit Testing**
- Framework: Vitest (already in use based on existing test files)
- Component Testing: React Testing Library
- Assertions: Vitest expect API
- Mocking: Vitest mock functions

**Property-Based Testing**
- Library: fast-check (JavaScript/TypeScript property-based testing library)
- Configuration: Minimum 100 iterations per property test
- Integration: Works seamlessly with Vitest

### Property Test Configuration

Each property test must:
1. Run minimum 100 iterations to ensure comprehensive input coverage
2. Include a comment tag referencing the design document property
3. Use appropriate generators for test data
4. Verify the property holds for all generated inputs

**Tag Format**:
```typescript
// Feature: showroom-auth-ux-improvement, Property 1: Admin Terminology Exclusion
test('login page should not contain admin-centric terminology', () => {
  fc.assert(
    fc.property(fc.record({ /* generators */ }), (input) => {
      // Property test implementation
    }),
    { numRuns: 100 }
  );
});
```

### Test Organization

**Unit Tests**
```
Code/frontend/src/__tests__/
├── auth/
│   ├── LoginPage.test.tsx
│   ├── AuthContext.test.tsx
│   └── ProtectedRoute.test.tsx
└── integration/
    └── auth-flow.test.tsx
```

**Property Tests**
```
Code/frontend/src/__tests__/
└── properties/
    ├── auth-properties.test.tsx
    ├── role-display-properties.test.tsx
    └── responsive-properties.test.tsx
```

### Test Coverage Goals

**Unit Test Coverage**:
- LoginPage component: 90%+ coverage
- AuthContext: 95%+ coverage (critical authentication logic)
- ProtectedRoute: 90%+ coverage
- Integration flows: All critical paths covered

**Property Test Coverage**:
- All 18 correctness properties implemented
- Each property validated with 100+ iterations
- Edge cases covered through random generation

### Key Test Scenarios

**Unit Test Scenarios**:
1. LoginPage renders with correct showroom-focused messaging
2. Form validation displays appropriate error messages
3. Password visibility toggle changes input type
4. Loading state displays during authentication
5. Successful login redirects to dashboard
6. Failed login displays error message
7. Protected routes redirect unauthenticated users
8. Logout clears authentication state
9. Session persistence across page refresh
10. Responsive layout at specific breakpoints (320px, 768px, 1024px, 1920px)

**Property Test Scenarios**:
1. Admin terminology never appears in login page (Property 1)
2. All showroom staff roles display correct context (Property 2)
3. Password toggle works for all input states (Property 3)
4. Form validation catches all empty field combinations (Property 4)
5. Loading state appears for all login attempts (Property 5)
6. All error types display appropriate messages (Property 6)
7. All showroom staff roles can authenticate (Property 7)
8. Customer role always rejected (Property 8)
9. Legacy routes maintain compatibility (Property 9)
10. Dashboard displays context for all users (Property 10)
11. Super admin options hidden from staff (Property 11)
12. Brand colors applied for all showrooms (Property 12)
13. Showroom name displays for all showrooms (Property 13)
14. Auth state persists for all successful logins (Property 14)
15. Logout clears state for all users (Property 15)
16. Protected routes check auth for all navigation (Property 16)
17. Expired sessions redirect for all users (Property 17)
18. Responsive layout works at all viewport sizes (Property 18)

### Test Data Generators

**For Property-Based Tests**:

```typescript
// User role generator
const roleGenerator = fc.oneof(
  fc.constant('Super Admin'),
  fc.constant('Showroom Manager'),
  fc.constant('Sales Executive'),
  fc.constant('Accountant'),
  fc.constant('Documentation Officer'),
  fc.constant('Customer')
);

// Showroom staff role generator (subset)
const showroomStaffRoleGenerator = fc.oneof(
  fc.constant('Showroom Manager'),
  fc.constant('Sales Executive'),
  fc.constant('Accountant'),
  fc.constant('Documentation Officer')
);

// Email generator
const emailGenerator = fc.emailAddress();

// Password generator
const passwordGenerator = fc.string({ minLength: 3, maxLength: 50 });

// Viewport size generator
const viewportGenerator = fc.integer({ min: 320, max: 2560 });

// User generator
const userGenerator = fc.record({
  id: fc.uuid(),
  fullName: fc.fullName(),
  email: fc.emailAddress(),
  mobile: fc.string({ minLength: 10, maxLength: 10 }),
  role: roleGenerator,
  showroomId: fc.option(fc.constantFrom('SH001', 'SH002', 'SH003', 'SH004'))
});

// Showroom generator
const showroomGenerator = fc.record({
  showroomId: fc.string(),
  name: fc.string(),
  brand: fc.constantFrom('Honda', 'Yamaha', 'Suzuki'),
  branding: fc.record({
    primaryColor: fc.hexaColor()
  })
});
```

### Continuous Integration

**Pre-commit Hooks**:
- Run unit tests on changed files
- Run linting and type checking
- Ensure no console.log statements in production code

**CI Pipeline**:
1. Install dependencies
2. Run all unit tests
3. Run all property-based tests
4. Generate coverage report
5. Fail build if coverage below threshold (85%)
6. Run E2E tests for critical auth flows

### Manual Testing Checklist

**Visual Testing**:
- [ ] Login page displays correctly on mobile (320px, 375px, 414px)
- [ ] Login page displays correctly on tablet (768px, 1024px)
- [ ] Login page displays correctly on desktop (1920px, 2560px)
- [ ] Showroom branding colors applied correctly
- [ ] Dark mode support (if applicable)
- [ ] Animations and transitions smooth
- [ ] Error messages clearly visible
- [ ] Loading states provide feedback

**Accessibility Testing**:
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces form labels and errors
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch targets minimum 44x44px on mobile

**Cross-Browser Testing**:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

