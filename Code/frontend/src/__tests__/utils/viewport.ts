/**
 * Viewport Testing Utilities
 * 
 * Provides utilities for testing responsive behavior across different viewport sizes.
 */

/**
 * Viewport size interface
 */
export interface ViewportSize {
  width: number;
  height: number;
}

/**
 * Viewport breakpoint categories
 */
export type ViewportCategory = 'mobile' | 'tablet' | 'desktop';

/**
 * Common viewport presets
 */
export const VIEWPORT_PRESETS = {
  // Mobile devices
  iphoneSE: { width: 375, height: 667 },
  iphone12: { width: 390, height: 844 },
  iphone14ProMax: { width: 430, height: 932 },
  galaxyS20: { width: 360, height: 800 },
  pixel5: { width: 393, height: 851 },
  
  // Tablets
  ipadMini: { width: 768, height: 1024 },
  ipad: { width: 810, height: 1080 },
  ipadPro: { width: 1024, height: 1366 },
  
  // Desktop
  laptop: { width: 1366, height: 768 },
  desktop: { width: 1920, height: 1080 },
  desktopLarge: { width: 2560, height: 1440 },
} as const;

/**
 * Breakpoint ranges
 */
export const BREAKPOINTS = {
  mobile: { min: 320, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: 2560 },
} as const;

/**
 * Set viewport size for testing
 */
export function setViewportSize(size: ViewportSize): void {
  // Update window dimensions
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: size.width,
  });
  
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: size.height,
  });
  
  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
}

/**
 * Restore default viewport size
 */
export function restoreViewport(): void {
  setViewportSize({ width: 1024, height: 768 });
}

/**
 * Get viewport category based on width
 */
export function getViewportCategory(width: number): ViewportCategory {
  if (width < BREAKPOINTS.tablet.min) {
    return 'mobile';
  } else if (width < BREAKPOINTS.desktop.min) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Check if viewport is mobile
 */
export function isMobileViewport(width: number): boolean {
  return width >= BREAKPOINTS.mobile.min && width <= BREAKPOINTS.mobile.max;
}

/**
 * Check if viewport is tablet
 */
export function isTabletViewport(width: number): boolean {
  return width >= BREAKPOINTS.tablet.min && width <= BREAKPOINTS.tablet.max;
}

/**
 * Check if viewport is desktop
 */
export function isDesktopViewport(width: number): boolean {
  return width >= BREAKPOINTS.desktop.min && width <= BREAKPOINTS.desktop.max;
}

/**
 * Check if viewport supports horizontal layout
 */
export function supportsHorizontalLayout(width: number): boolean {
  return width >= BREAKPOINTS.desktop.min;
}

/**
 * Check if viewport requires vertical stacking
 */
export function requiresVerticalStacking(width: number): boolean {
  return width < BREAKPOINTS.tablet.min;
}

/**
 * Get minimum touch target size for viewport
 */
export function getMinimumTouchTargetSize(width: number): number {
  // Mobile devices require 44x44px minimum touch targets
  return isMobileViewport(width) ? 44 : 32;
}

/**
 * Test helper to run assertions across multiple viewports
 */
export function testAcrossViewports(
  viewports: ViewportSize[],
  testFn: (viewport: ViewportSize) => void
): void {
  viewports.forEach(viewport => {
    setViewportSize(viewport);
    testFn(viewport);
  });
  restoreViewport();
}

/**
 * Test helper to run assertions across all breakpoint categories
 */
export function testAcrossBreakpoints(
  testFn: (viewport: ViewportSize, category: ViewportCategory) => void
): void {
  const testViewports: Array<{ viewport: ViewportSize; category: ViewportCategory }> = [
    { viewport: VIEWPORT_PRESETS.iphoneSE, category: 'mobile' },
    { viewport: VIEWPORT_PRESETS.ipad, category: 'tablet' },
    { viewport: VIEWPORT_PRESETS.desktop, category: 'desktop' },
  ];
  
  testViewports.forEach(({ viewport, category }) => {
    setViewportSize(viewport);
    testFn(viewport, category);
  });
  
  restoreViewport();
}

/**
 * Mock matchMedia for testing responsive behavior
 */
export function mockMatchMedia(matches: boolean = false): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  });
}

/**
 * Create a responsive test context
 */
export function createResponsiveTestContext(viewport: ViewportSize) {
  setViewportSize(viewport);
  
  return {
    viewport,
    category: getViewportCategory(viewport.width),
    isMobile: isMobileViewport(viewport.width),
    isTablet: isTabletViewport(viewport.width),
    isDesktop: isDesktopViewport(viewport.width),
    minTouchTarget: getMinimumTouchTargetSize(viewport.width),
    cleanup: restoreViewport,
  };
}
