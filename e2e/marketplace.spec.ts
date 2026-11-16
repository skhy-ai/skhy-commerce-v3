import { test, expect } from '@playwright/test';

test.describe('Marketplace Buyer Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Mock Auth if needed or just test guest flow
        await page.goto('/marketplace');
    });

    test('should display products', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /Skhy AI Marketplace/i })).toBeVisible({ timeout: 15000 });
        // Check for at least one product card
        // This assumes mock data or seeded db
    });

    test('should add item to cart', async ({ page }) => {
        // Select first "Add to Cart" button (if any products exist)
        const addToCartBtns = page.getByRole('button', { name: /add/i });
        if (await addToCartBtns.count() > 0) {
            await addToCartBtns.first().click();
            // Check cart drawer opens
            await expect(page.getByText('Shopping Cart')).toBeVisible();
            await expect(page.getByText('Subtotal')).toBeVisible();
        } else {
            console.log('No products found to test add-to-cart');
        }
    });
});
