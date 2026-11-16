import { test, expect } from '@playwright/test';

test.describe('Marketplace Networking Errors', () => {

  test('Shows graceful error when API fails (Mocking Supabase)', async ({ page }) => {
    // Intercept the API call to supabase products and mock it failing
    await page.route('**/rest/v1/products*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error Database Down' }),
      });
    });

    await page.goto('/marketplace');

    // Wait and verify we don't have a crash boundary,
    // and ideally the UI logs or gracefully degenerates into empty states
    // In our marketplace, products map to a list. If it's empty or failed, it shouldn't crash.
    const productGrid = page.getByRole('heading', { name: /Skhy AI Marketplace/i }); 
    await expect(productGrid).toBeVisible();
    
    // Ensure we don't see the ErrorBoundary
    await expect(page.locator('text=Something went wrong')).not.toBeVisible();
  });

});
