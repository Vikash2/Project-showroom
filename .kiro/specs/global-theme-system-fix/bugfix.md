# Bugfix Requirements Document

## Introduction

The multi-module React web application (dashboard, vehicle catalog, inquiry system, booking system) has an inconsistent and buggy global theming system. The current implementation uses CSS classes (.dark) instead of data attributes, lacks FOUC prevention, has no Tailwind darkMode configuration, and contains numerous hardcoded color values that prevent components from responding to theme changes. This results in components remaining stuck in light mode, modals/dropdowns ignoring theme settings, incorrect table backgrounds, unreadable input fields, and inconsistent UI elements across the application.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the user toggles between Light/Dark/System themes using ThemeToggle THEN many components (Sidebar, Navbar sections, Modals, Dropdowns, Tables, Cards) do not update their appearance and remain in their original theme state

1.2 WHEN the page loads or refreshes THEN there is a visible flash of unstyled content (FOUC) where the wrong theme briefly appears before the correct theme is applied

1.3 WHEN components use hardcoded Tailwind utility classes (e.g., bg-white, text-gray-900, border-gray-200) THEN these components do not respond to theme changes because they bypass the CSS variable system

1.4 WHEN the Tailwind config has no darkMode configuration THEN the dark: prefix classes do not function correctly or consistently across the application

1.5 WHEN input fields are rendered in dark mode THEN text color and background color have insufficient contrast making them unreadable (e.g., gray text on dark gray background)

1.6 WHEN disabled buttons are displayed in dark mode THEN they become nearly invisible due to low contrast with the background

1.7 WHEN cards use hardcoded bg-white backgrounds THEN they remain white in dark mode instead of adapting to dark theme colors

1.8 WHEN charts and data visualizations are rendered THEN they do not dynamically adapt their colors (axis, grid lines, tooltips) to the current theme

1.9 WHEN scrollbars are displayed THEN their styling is mismatched with the current theme

1.10 WHEN skeleton loaders are shown THEN they use incorrect colors that don't match the current theme

1.11 WHEN toast notifications appear THEN their styling is inconsistent with the current theme

1.12 WHEN the ThemeProvider applies theme changes using classList.add('dark') THEN this CSS class-based approach is not the single source of truth and conflicts with data attribute-based theming best practices

### Expected Behavior (Correct)

2.1 WHEN the user toggles between Light/Dark/System themes using ThemeToggle THEN ALL components (Navbar, Sidebar, Cards, Tables, Forms, Modals, Status badges, Price calculator, Timeline, Notifications) SHALL immediately update their appearance to reflect the selected theme

2.2 WHEN the page loads or refreshes THEN the correct theme SHALL be applied BEFORE React renders using an inline script in the <head> section to prevent any flash of unstyled content (FOUC)

2.3 WHEN components need colors THEN they SHALL use CSS variables with semantic tokens (e.g., var(--background), var(--foreground), var(--border)) instead of hardcoded Tailwind utility classes

2.4 WHEN the Tailwind config is loaded THEN it SHALL include darkMode: 'selector' configuration with data-theme attribute support to enable proper dark mode functionality

2.5 WHEN input fields are rendered in dark mode THEN they SHALL maintain WCAG AA contrast ratios with clearly visible text against the background

2.6 WHEN disabled buttons are displayed in dark mode THEN they SHALL have sufficient contrast to remain visible while appearing disabled

2.7 WHEN cards are rendered THEN they SHALL use CSS variable-based backgrounds (e.g., var(--card-bg)) that automatically adapt to the current theme

2.8 WHEN charts and data visualizations are rendered THEN they SHALL dynamically adapt all colors (axis, grid lines, tooltips, data series) based on the current theme

2.9 WHEN scrollbars are displayed THEN they SHALL use theme-aware styling that matches the current theme

2.10 WHEN skeleton loaders are shown THEN they SHALL use CSS variable-based colors that automatically match the current theme

2.11 WHEN toast notifications appear THEN they SHALL use theme-aware styling consistent with the current theme

2.12 WHEN the ThemeProvider manages theme state THEN it SHALL use data attributes (data-theme="light|dark") on the root element as the single source of truth, with theme preference persisted in localStorage and system preference fallback

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the Honda red palette (primary colors) is used in branding elements THEN the system SHALL CONTINUE TO maintain Honda red color consistency across both light and dark themes

3.2 WHEN the theme toggle UI is displayed in the Navbar (top-right) THEN it SHALL CONTINUE TO show Light/Dark/System options with the current selection indicated

3.3 WHEN theme transitions occur THEN they SHALL CONTINUE TO use smooth 200-300ms transitions for visual polish

3.4 WHEN the user's theme preference is stored THEN it SHALL CONTINUE TO persist in localStorage with the key "showroom-vms-theme"

3.5 WHEN the application is accessed on mobile and desktop devices THEN theme functionality SHALL CONTINUE TO work correctly on both platforms

3.6 WHEN the user refreshes the page THEN the previously selected theme preference SHALL CONTINUE TO be retained and applied

3.7 WHEN the System theme option is selected THEN the application SHALL CONTINUE TO respect the user's operating system color scheme preference

3.8 WHEN focus outlines are displayed for accessibility THEN they SHALL CONTINUE TO be visible and meet accessibility standards

3.9 WHEN the ShowroomSelector component displays showroom branding colors THEN it SHALL CONTINUE TO use the activeShowroom.branding.primaryColor for dynamic branding

3.10 WHEN existing component functionality (navigation, forms, modals, data display) operates THEN it SHALL CONTINUE TO function correctly without behavioral changes beyond visual theming
