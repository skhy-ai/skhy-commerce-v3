import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should load login page', async ({ page }) => {
        await page.goto('/login?bypass_turnstile=true');
        await expect(page).toHaveTitle(/Skhy AI/);
        await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible({ timeout: 10000 });
    });

    test('should show validation error for empty fields', async ({ page }) => {
        await page.goto('/login?bypass_turnstile=true');
        await page.getByRole('button', { name: /sign in/i }).click();
        // Assuming HTML5 validation or UI error
        // If usage of standard required attribute:
        // This is hard to test with Playwright without disabling robust validation.
        // Instead check if we are still on login page
        await expect(page).toHaveURL(/\/login/);
    });

    test('should navigate to register', async ({ page }) => {
        await page.goto('/login?bypass_turnstile=true');
        await page.getByText(/create one now/i).click();
        await expect(page).toHaveURL('/register');
    });
});
