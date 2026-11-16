import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test('Mobile navigation menu works', async ({ page, isMobile }) => {
    // Only run this test if we are executing on a mobile device profile
    test.skip(!isMobile, 'This test is only relevant for mobile environments');

    await page.goto('/');

    // Look for the hamburger icon often used on mobile
    const hamburgerMenuButton = page.getByRole('button', { name: 'Open global menu' }).or(
        page.locator('button[aria-controls="mobile-menu"]')
    ).or(
        page.locator('button.md\\:hidden') // Tailwind generic hide
    ).first();

    // Sometimes the initial loading takes a second on the emulated slow connection
    await expect(hamburgerMenuButton).toBeVisible();

    await hamburgerMenuButton.click();

    // Check that one of the core nav elements appears
    const marketplaceLink = page.getByRole('link', { name: 'Marketplace' }).last();
    
    // We expect it to become visible
    await expect(marketplaceLink).toBeVisible();
  });
});
