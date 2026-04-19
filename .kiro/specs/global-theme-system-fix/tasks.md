# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Theme Toggle Components Not Updating
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope the property to the concrete failing case(s) to ensure reproducibility
  - Test that theme changes (light→dark, dark→light, system) update all components correctly
  - Verify ThemeProvider uses classList instead of data-theme (from Bug Condition in design)
  - Verify Tailwind config lacks darkMode configuration
  - Verify components use hardcoded colors (bg-white, text-gray-900) instead of CSS variables
  - Verify FOUC occurs on page load with stored theme preference
  - The test assertions should match the Expected Behavior Properties from design
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found to understand root cause
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.12_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Existing Functionality Preserved
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test Honda red branding consistency across themes
  - Test theme persistence in localStorage with key "showroom-vms-theme"
  - Test smooth transitions (200-300ms) during theme changes
  - Test mobile and desktop theme functionality
  - Test theme preference retention on page refresh
  - Test System theme option respecting OS preference
  - Test focus outlines for accessibility
  - Test ShowroomSelector dynamic branding colors
  - Test component functionality (navigation, forms, modals, data display)
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 3. Fix for global theme system

  - [x] 3.1 Add FOUC prevention script to index.html
    - Insert inline script in <head> before any other scripts
    - Read theme from localStorage ('showroom-vms-theme')
    - Detect system preference if theme is 'system'
    - Set data-theme attribute on <html> element immediately
    - Prevents flash by applying theme before React renders
    - _Bug_Condition: isBugCondition(pageLoad) where FOUC occurs_
    - _Expected_Behavior: No FOUC, theme applied immediately_
    - _Preservation: Theme persistence with "showroom-vms-theme" key_
    - _Requirements: 1.2, 2.2, 3.4, 3.6_

  - [x] 3.2 Configure Tailwind darkMode
    - Add darkMode: ['selector', '[data-theme="dark"]'] to tailwind.config.js
    - Enables dark: prefix classes to work with data-theme attribute
    - Allows Tailwind to generate proper dark mode utilities
    - Ensures consistency with data-attribute approach
    - _Bug_Condition: isBugCondition(themeChange) where Tailwind dark: classes don't work_
    - _Expected_Behavior: dark: classes function correctly with data-theme_
    - _Preservation: Existing Tailwind utilities continue to work_
    - _Requirements: 1.4, 2.4_

  - [x] 3.3 Update ThemeContext to use data-theme attribute
    - Replace classList.add('dark') with root.setAttribute('data-theme', resolvedTheme)
    - Use data-theme="light" or data-theme="dark" as single source of truth
    - Remove classList manipulation entirely
    - Update system theme detection to set correct data-theme value
    - Listen to matchMedia changes for system preference updates
    - Apply data-theme immediately when system preference changes
    - Update storageKey to 'showroom-vms-theme' for consistency
    - _Bug_Condition: isBugCondition(themeChange) where classList conflicts with data-theme_
    - _Expected_Behavior: data-theme attribute as single source of truth_
    - _Preservation: Theme persistence, system preference, smooth transitions_
    - _Requirements: 1.12, 2.12, 3.4, 3.7_

  - [x] 3.4 Update CSS variable scoping in index.css
    - Change from .dark { } to [data-theme="dark"] { }
    - Ensures CSS variables update when data-theme changes
    - Add missing semantic tokens: --card-bg, --card-border, --input-bg, --input-border, --input-text, --disabled-bg, --disabled-text, --modal-bg, --modal-overlay, --table-header-bg, --table-row-hover, --scrollbar-track, --scrollbar-thumb, --skeleton-base, --skeleton-highlight, --toast-bg, --toast-border
    - Improve contrast ratios for WCAG AA compliance
    - Input text: use --foreground (#f8fafc) instead of muted grays
    - Disabled buttons: increase opacity from 50% to 60% with border
    - Table text: ensure sufficient contrast on dark backgrounds
    - _Bug_Condition: isBugCondition(themeChange) where CSS variables don't update_
    - _Expected_Behavior: CSS variables update immediately with data-theme_
    - _Preservation: Honda red branding, smooth transitions_
    - _Requirements: 1.5, 1.6, 2.3, 2.5, 2.6, 2.7, 2.9, 2.10, 2.11, 3.1, 3.3_

  - [x] 3.5 Refactor ThemeToggle component
    - Replace bg-gray-100 dark:bg-gray-800 with bg-[var(--card-bg)]
    - Use text-[var(--foreground)] for icon color
    - Use border-[var(--border)] for dropdown border
    - _Bug_Condition: isBugCondition(themeChange) where ThemeToggle uses hardcoded colors_
    - _Expected_Behavior: ThemeToggle uses CSS variables_
    - _Preservation: ThemeToggle UI in Navbar top-right_
    - _Requirements: 1.3, 2.3, 3.2_

  - [x] 3.6 Refactor Navbar component
    - Replace text-slate-600 dark:text-slate-400 with text-[var(--muted)]
    - Replace bg-slate-200 dark:bg-slate-800 with bg-[var(--border)]
    - Replace border-slate-100 dark:border-slate-800 with border-[var(--border)]
    - _Bug_Condition: isBugCondition(themeChange) where Navbar uses hardcoded colors_
    - _Expected_Behavior: Navbar uses CSS variables_
    - _Preservation: Navbar functionality and layout_
    - _Requirements: 1.1, 1.3, 2.1, 2.3, 3.10_

  - [x] 3.7 Refactor VehicleCard component
    - Replace text-slate-900 dark:text-white with text-[var(--foreground)]
    - Replace text-slate-500 dark:text-slate-400 with text-[var(--muted)]
    - Replace border-slate-100 dark:border-slate-800/60 with border-[var(--border)]
    - _Bug_Condition: isBugCondition(themeChange) where VehicleCard uses hardcoded colors_
    - _Expected_Behavior: VehicleCard uses CSS variables_
    - _Preservation: VehicleCard functionality_
    - _Requirements: 1.1, 1.3, 1.7, 2.1, 2.3, 2.7, 3.10_

  - [x] 3.8 Refactor Hero component
    - Replace bg-white dark:bg-slate-950 with bg-[var(--background)]
    - Replace text-slate-900 dark:text-white with text-[var(--foreground)]
    - Replace text-slate-600 dark:text-slate-400 with text-[var(--muted)]
    - Replace border-slate-100 dark:border-slate-800/50 with border-[var(--border)]
    - _Bug_Condition: isBugCondition(themeChange) where Hero uses hardcoded colors_
    - _Expected_Behavior: Hero uses CSS variables_
    - _Preservation: Hero functionality_
    - _Requirements: 1.1, 1.3, 1.7, 2.1, 2.3, 2.7, 3.10_

  - [x] 3.9 Refactor InquiryForm component
    - Update input fields to use input-specific CSS variables
    - Background: bg-[var(--input-bg)]
    - Text: text-[var(--input-text)]
    - Border: border-[var(--input-border)]
    - _Bug_Condition: isBugCondition(themeChange) where InquiryForm inputs have poor contrast_
    - _Expected_Behavior: Input fields have WCAG AA contrast_
    - _Preservation: Form submission and validation logic_
    - _Requirements: 1.3, 1.5, 2.3, 2.5, 3.10_

  - [x] 3.10 Refactor AdminLayout component
    - Update sidebar background: bg-[var(--card-bg)]
    - Update sidebar borders: border-[var(--border)]
    - Update active states with CSS variables and opacity modifiers
    - _Bug_Condition: isBugCondition(themeChange) where AdminLayout uses hardcoded colors_
    - _Expected_Behavior: AdminLayout uses CSS variables_
    - _Preservation: Admin navigation and layout functionality_
    - _Requirements: 1.1, 1.3, 1.7, 2.1, 2.3, 2.7, 3.10_

  - [x] 3.11 Refactor all admin page components
    - Apply systematic refactoring to all admin pages
    - Replace bg-white with bg-[var(--background)] or bg-[var(--card-bg)]
    - Replace text-gray-* with text-[var(--foreground)] or text-[var(--muted)]
    - Replace border-gray-* with border-[var(--border)]
    - Update table, modal, dropdown, badge, and status components
    - Ensure disabled states use --disabled-* variables
    - Update skeleton loaders to use --skeleton-* variables
    - _Bug_Condition: isBugCondition(themeChange) where admin pages use hardcoded colors_
    - _Expected_Behavior: All admin pages use CSS variables_
    - _Preservation: All admin functionality (data display, forms, tables)_
    - _Requirements: 1.1, 1.3, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 2.1, 2.3, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 3.10_

  - [x] 3.12 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Theme Toggle Components Updating
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12_

  - [x] 3.13 Verify preservation tests still pass
    - **Property 2: Preservation** - Existing Functionality Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
