/**
 * Testing Infrastructure Verification
 * 
 * This test file verifies that the testing infrastructure is properly set up
 * and all utilities are working correctly.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  roleGenerator,
  showroomStaffRoleGenerator,
  emailGenerator,
  passwordGenerator,
  viewportGenerator,
  userGenerator,
  showroomGenerator,
} from './utils/generators';
import {
  createMockUser,
  createMockShowroomManager,
  getRoleDisplayName,
  getRoleContext,
  isShowroomStaffRole,
} from './utils/mockUser';
import {
  setViewportSize,
  restoreViewport,
  getViewportCategory,
  isMobileViewport,
  isTabletViewport,
  isDesktopViewport,
  VIEWPORT_PRESETS,
} from './utils/viewport';

describe('Testing Infrastructure', () => {
  describe('fast-check integration', () => {
    it('should generate random roles', () => {
      fc.assert(
        fc.property(roleGenerator, (role) => {
          expect(role).toBeDefined();
          expect(typeof role).toBe('string');
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate showroom staff roles only', () => {
      fc.assert(
        fc.property(showroomStaffRoleGenerator, (role) => {
          expect(role).not.toBe('Customer');
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate valid email addresses', () => {
      fc.assert(
        fc.property(emailGenerator, (email) => {
          expect(email).toMatch(/@/);
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate passwords with minimum length', () => {
      fc.assert(
        fc.property(passwordGenerator, (password) => {
          expect(password.length).toBeGreaterThanOrEqual(3);
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate viewport sizes in valid range', () => {
      fc.assert(
        fc.property(viewportGenerator, (viewport) => {
          expect(viewport.width).toBeGreaterThanOrEqual(320);
          expect(viewport.width).toBeLessThanOrEqual(2560);
          expect(viewport.height).toBeGreaterThanOrEqual(568);
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate complete user objects', () => {
      fc.assert(
        fc.property(userGenerator, (user) => {
          expect(user.id).toBeDefined();
          expect(user.fullName).toBeDefined();
          expect(user.mobile).toBeDefined();
          expect(user.role).toBeDefined();
          return true;
        }),
        { numRuns: 10 }
      );
    });

    it('should generate showroom objects', () => {
      fc.assert(
        fc.property(showroomGenerator, (showroom) => {
          expect(showroom.showroomId).toBeDefined();
          expect(showroom.name).toBeDefined();
          expect(showroom.brand).toBe('Honda');
          expect(showroom.branding.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
          return true;
        }),
        { numRuns: 10 }
      );
    });
  });

  describe('User mocking utilities', () => {
    it('should create mock user with specified role', () => {
      const user = createMockUser('Showroom Manager');
      expect(user.role).toBe('Showroom Manager');
      expect(user.id).toBeDefined();
      expect(user.fullName).toBeDefined();
    });

    it('should create mock showroom manager', () => {
      const manager = createMockShowroomManager();
      expect(manager.role).toBe('Showroom Manager');
      expect(manager.showroomId).toBeDefined();
    });

    it('should get correct role display name', () => {
      expect(getRoleDisplayName('Super Admin')).toBe('System Administrator');
      expect(getRoleDisplayName('Showroom Manager')).toBe('Showroom Manager');
    });

    it('should get correct role context', () => {
      expect(getRoleContext('Super Admin')).toBe('System Level');
      expect(getRoleContext('Showroom Manager')).toBe('Showroom Staff');
      expect(getRoleContext('Customer')).toBe('Customer');
    });

    it('should identify showroom staff roles', () => {
      expect(isShowroomStaffRole('Showroom Manager')).toBe(true);
      expect(isShowroomStaffRole('Sales Executive')).toBe(true);
      expect(isShowroomStaffRole('Customer')).toBe(false);
    });
  });

  describe('Viewport testing utilities', () => {
    it('should set and restore viewport size', () => {
      setViewportSize({ width: 375, height: 667 });
      expect(window.innerWidth).toBe(375);
      expect(window.innerHeight).toBe(667);
      
      restoreViewport();
      expect(window.innerWidth).toBe(1024);
      expect(window.innerHeight).toBe(768);
    });

    it('should categorize viewport sizes correctly', () => {
      expect(getViewportCategory(375)).toBe('mobile');
      expect(getViewportCategory(768)).toBe('tablet');
      expect(getViewportCategory(1024)).toBe('desktop');
    });

    it('should identify mobile viewports', () => {
      expect(isMobileViewport(375)).toBe(true);
      expect(isMobileViewport(768)).toBe(false);
    });

    it('should identify tablet viewports', () => {
      expect(isTabletViewport(768)).toBe(true);
      expect(isTabletViewport(1024)).toBe(false);
    });

    it('should identify desktop viewports', () => {
      expect(isDesktopViewport(1024)).toBe(true);
      expect(isDesktopViewport(767)).toBe(false);
    });

    it('should provide viewport presets', () => {
      expect(VIEWPORT_PRESETS.iphoneSE).toEqual({ width: 375, height: 667 });
      expect(VIEWPORT_PRESETS.ipad).toEqual({ width: 810, height: 1080 });
      expect(VIEWPORT_PRESETS.desktop).toEqual({ width: 1920, height: 1080 });
    });
  });
});
