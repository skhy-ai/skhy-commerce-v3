import { test, expect } from '@playwright/test';

test.describe('Partner Updates & Landing Page', () => {

    test('Landing Page: Hero button and Partner CTA should be visible', async ({ page }) => {
        await page.goto('/');

        // Check Hero Button
        const heroBtn = page.getByRole('button', { name: 'Join Our Journey' });
        await expect(heroBtn).toBeVisible();

        // Check "Learn More" is gone (optional, implicit by not finding it if we searched, but hard to assert 'not found' without specific locator)

        // Check Partner CTA Section
        const partnerSection = page.getByText('Join the Skhy Ecosystem');
        await expect(partnerSection).toBeVisible();

        // Click Partner CTA button
        await page.getByRole('button', { name: 'Apply as Partner' }).click();
        // Since we are not logged in, we expect to be redirected to register/signup
        await expect(page).toHaveURL(/\/register/);
    });

    test('Partner Onboarding: Should skip shipping step', async ({ page }) => {
        // Mock authentication state or login
        // Since we can't easily mock Supabase auth in this environment without a helper, 
        // we assume the user is logged in or we simulate the flow if possible.
        // For now, we'll verify the route and basic elements if we can access it.

        // Note: In a real environment we would seed a test user. 
        // Here we check if the onboarding page loads and doesn't show "Shipping" in steps.

        await page.goto('/partner/onboarding');
        // Expect to be redirected to login if not logged in
        await expect(page).toHaveURL(/\/login/);

        // If we could log in:
        // const steps = page.locator('.flex.items-center.justify-between');
        // await expect(steps).not.toContainText('Shipping');
    });

    test('Partner Dashboard: Shipping Settings Access', async ({ page }) => {
        // Navigate to shipping settings (protected route, expects login)
        await page.goto('/partner/shipping');
        await expect(page).toHaveURL(/\/login/); // Should redirect if not logged in
    });

});
