# Testing Infrastructure

This directory contains the testing infrastructure for the Vehicle Showroom Management System frontend.

## Structure

```
__tests__/
├── setup.ts                 # Global test setup and configuration
├── utils/                   # Test utilities and helpers
│   ├── generators.ts        # Property-based test data generators
│   ├── mockUser.ts          # User mocking utilities
│   ├── viewport.ts          # Viewport testing utilities
│   └── index.ts             # Central export point
├── properties/              # Property-based tests (to be created)
└── integration/             # Integration tests (to be created)
```

## Testing Frameworks

- **Vitest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **fast-check**: Property-based testing library
- **jsdom**: DOM implementation for Node.js

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Test Utilities

### Generators (`utils/generators.ts`)

Property-based test data generators using fast-check:

- `roleGenerator`: All user roles
- `showroomStaffRoleGenerator`: Showroom staff roles only
- `emailGenerator`: Valid email addresses
- `passwordGenerator`: Valid passwords
- `viewportGenerator`: Viewport sizes (320px-2560px)
- `userGenerator`: Complete user objects
- `showroomGenerator`: Showroom objects

### User Mocking (`utils/mockUser.ts`)

Utilities for creating mock users:

- `createMockUser(role, overrides?)`: Create user with specific role
- `createMockShowroomManager()`: Create showroom manager
- `createMockSalesExecutive()`: Create sales executive
- `createMockAccountant()`: Create accountant
- `createMockDocumentationOfficer()`: Create documentation officer
- `createMockSuperAdmin()`: Create super admin
- `createMockCustomer()`: Create customer
- `getRoleDisplayName(role)`: Get display name for role
- `getRoleContext(role)`: Get role context (System Level/Showroom Staff)

### Viewport Testing (`utils/viewport.ts`)

Utilities for responsive testing:

- `setViewportSize(size)`: Set viewport dimensions
- `restoreViewport()`: Reset to default viewport
- `getViewportCategory(width)`: Get category (mobile/tablet/desktop)
- `testAcrossViewports(viewports, testFn)`: Run test across multiple viewports
- `testAcrossBreakpoints(testFn)`: Run test across all breakpoint categories
- `VIEWPORT_PRESETS`: Common device viewport sizes
- `BREAKPOINTS`: Breakpoint ranges

## Property-Based Testing

Property-based tests verify that properties hold true across all generated inputs. Each property test should:

1. Run minimum 100 iterations
2. Include a comment referencing the design document property
3. Use appropriate generators from `utils/generators.ts`
4. Verify the property holds for all inputs

Example:

```typescript
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { roleGenerator } from './utils/generators';

// Feature: showroom-auth-ux-improvement, Property 2: Role Context Display
describe('Property 2: Role Context Display', () => {
  it('should display correct role context for all showroom staff roles', () => {
    fc.assert(
      fc.property(roleGenerator, (role) => {
        // Test implementation
      }),
      { numRuns: 100 }
    );
  });
});
```

## Unit Testing

Unit tests verify specific examples and edge cases. Use React Testing Library for component tests:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginPage } from '../pages/auth/LoginPage';

describe('LoginPage', () => {
  it('should display showroom staff login heading', () => {
    render(<LoginPage />);
    expect(screen.getByText('Showroom Staff Login')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Use descriptive test names**: Test names should clearly describe what is being tested
2. **Test behavior, not implementation**: Focus on user-facing behavior
3. **Keep tests isolated**: Each test should be independent
4. **Use appropriate generators**: Choose generators that match your test domain
5. **Clean up after tests**: Use `afterEach` hooks to reset state
6. **Mock external dependencies**: Use mocks for API calls, context providers, etc.

## Coverage Goals

- Unit tests: 90%+ coverage for critical components
- Property tests: All 18 correctness properties from design document
- Integration tests: All critical user flows

## Related Documentation

- [Design Document](../../../.kiro/specs/showroom-auth-ux-improvement/design.md)
- [Requirements](../../../.kiro/specs/showroom-auth-ux-improvement/requirements.md)
- [Tasks](../../../.kiro/specs/showroom-auth-ux-improvement/tasks.md)
