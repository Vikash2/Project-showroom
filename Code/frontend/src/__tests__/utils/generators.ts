/**
 * Test Data Generators for Property-Based Testing
 * 
 * This module provides fast-check generators for creating test data
 * used in property-based tests throughout the authentication UX improvement feature.
 */

import * as fc from 'fast-check';
import type { Role } from '../../types/auth';

/**
 * Generator for all user roles
 */
export const roleGenerator = fc.oneof(
  fc.constant<Role>('Super Admin'),
  fc.constant<Role>('Showroom Manager'),
  fc.constant<Role>('Sales Executive'),
  fc.constant<Role>('Accountant'),
  fc.constant<Role>('Documentation Officer'),
  fc.constant<Role>('Customer')
);

/**
 * Generator for showroom staff roles only (excludes Customer)
 */
export const showroomStaffRoleGenerator = fc.oneof(
  fc.constant<Role>('Super Admin'),
  fc.constant<Role>('Showroom Manager'),
  fc.constant<Role>('Sales Executive'),
  fc.constant<Role>('Accountant'),
  fc.constant<Role>('Documentation Officer')
);

/**
 * Generator for non-showroom roles (Customer only in current system)
 */
export const nonShowroomRoleGenerator = fc.constant<Role>('Customer');

/**
 * Generator for email addresses
 */
export const emailGenerator = fc.emailAddress();

/**
 * Generator for passwords (minimum 3 characters as per validation rules)
 */
export const passwordGenerator = fc.string({ minLength: 3, maxLength: 50 });

/**
 * Generator for short passwords (below minimum length)
 */
export const shortPasswordGenerator = fc.string({ minLength: 0, maxLength: 2 });

/**
 * Generator for viewport widths (320px to 2560px)
 */
export const viewportWidthGenerator = fc.integer({ min: 320, max: 2560 });

/**
 * Generator for viewport heights (common range)
 */
export const viewportHeightGenerator = fc.integer({ min: 568, max: 1440 });

/**
 * Generator for viewport sizes (width and height)
 */
export const viewportGenerator = fc.record({
  width: viewportWidthGenerator,
  height: viewportHeightGenerator,
});

/**
 * Generator for mobile viewport sizes
 */
export const mobileViewportGenerator = fc.record({
  width: fc.integer({ min: 320, max: 767 }),
  height: fc.integer({ min: 568, max: 926 }),
});

/**
 * Generator for tablet viewport sizes
 */
export const tabletViewportGenerator = fc.record({
  width: fc.integer({ min: 768, max: 1023 }),
  height: fc.integer({ min: 768, max: 1366 }),
});

/**
 * Generator for desktop viewport sizes
 */
export const desktopViewportGenerator = fc.record({
  width: fc.integer({ min: 1024, max: 2560 }),
  height: fc.integer({ min: 768, max: 1440 }),
});

/**
 * Generator for showroom IDs
 */
export const showroomIdGenerator = fc.constantFrom('SH001', 'SH002', 'SH003', 'SH004');

/**
 * Generator for user full names
 */
export const fullNameGenerator = fc.string({ minLength: 3, maxLength: 50 });

/**
 * Generator for mobile numbers (10 digits)
 */
export const mobileGenerator = fc.stringMatching(/^[6-9]\d{9}$/);

/**
 * Generator for hex colors
 */
export const hexColorGenerator = fc.integer({ min: 0, max: 0xFFFFFF })
  .map(num => `#${num.toString(16).padStart(6, '0')}`);

/**
 * Generator for User objects
 */
export const userGenerator = fc.record({
  id: fc.uuid(),
  fullName: fullNameGenerator,
  email: fc.option(emailGenerator, { nil: undefined }),
  mobile: mobileGenerator,
  role: roleGenerator,
  showroomId: fc.option(showroomIdGenerator, { nil: undefined }),
  profileImage: fc.option(fc.webUrl(), { nil: undefined }),
});

/**
 * Generator for showroom staff User objects
 */
export const showroomStaffUserGenerator = fc.record({
  id: fc.uuid(),
  fullName: fullNameGenerator,
  email: fc.option(emailGenerator, { nil: undefined }),
  mobile: mobileGenerator,
  role: showroomStaffRoleGenerator,
  showroomId: fc.option(showroomIdGenerator, { nil: undefined }),
  profileImage: fc.option(fc.webUrl(), { nil: undefined }),
});

/**
 * Generator for customer User objects
 */
export const customerUserGenerator = fc.record({
  id: fc.uuid(),
  fullName: fullNameGenerator,
  email: fc.option(emailGenerator, { nil: undefined }),
  mobile: mobileGenerator,
  role: fc.constant<Role>('Customer'),
  showroomId: fc.option(showroomIdGenerator, { nil: undefined }),
  profileImage: fc.option(fc.webUrl(), { nil: undefined }),
});

/**
 * Generator for showroom objects
 */
export const showroomGenerator = fc.record({
  showroomId: showroomIdGenerator,
  name: fc.constantFrom(
    'Sandhya Honda',
    'Sandhya Honda Bokaro',
    'Monka Honda',
    'Dua Honda'
  ),
  brand: fc.constant('Honda'),
  branding: fc.record({
    primaryColor: hexColorGenerator,
  }),
});

/**
 * Generator for login credentials
 */
export const loginCredentialsGenerator = fc.record({
  email: emailGenerator,
  password: passwordGenerator,
});

/**
 * Generator for invalid email formats
 */
export const invalidEmailGenerator = fc.oneof(
  fc.constant('notanemail'),
  fc.constant('missing@domain'),
  fc.constant('@nodomain.com'),
  fc.constant('spaces in@email.com'),
  fc.constant(''),
);

/**
 * Generator for empty form fields
 */
export const emptyFieldGenerator = fc.record({
  email: fc.constantFrom('', 'valid@email.com'),
  password: fc.constantFrom('', 'validpassword'),
}).filter(fields => fields.email === '' || fields.password === '');
