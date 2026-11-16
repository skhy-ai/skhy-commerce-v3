import { test, expect } from '@playwright/test';

test.describe('Browser Compatibility & Safe Storage', () => {
  test('HomePage should load without ErrorBoundary crashing', async ({ page, browserName }) => {
    
    // Simulate a strict environment where localStorage throws an error
    // (like Private Mode with Strict Tracking enabled on iOS)
    if (browserName === 'webkit') {
      await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          get: () => { throw new Error("SecurityError: The operation is insecure."); }
        });
        Object.defineProperty(window, 'sessionStorage', {
          get: () => { throw new Error("SecurityError: The operation is insecure."); }
        });
      });
    }

    await page.goto('/marketplace');

    // 1. Verify we don't see the ErrorBoundary fallback UI
    const errorHeading = page.locator('text=Something went wrong');
    await expect(errorHeading).not.toBeVisible();

    // 2. Verify the core page loaded successfully
    await expect(page).toHaveTitle(/Skhy AI/);
    const heroSection = page.locator('text=Skhy AI Marketplace');
    await expect(heroSection).toBeVisible();
  });
});
