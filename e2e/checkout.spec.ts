import { test, expect, Page } from '@playwright/test';

test.describe('Checkout Flow', () => {

    // Setup: Mock Cart and System Config
    test.beforeEach(async ({ page }) => {
        // Mock Geolocation to unblock App loading
        await page.route('https://ipapi.co/json/', async route => {
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ country_code: 'US' }) });
        });

        // Mock System Config with conditional responses
        await page.route('**/rest/v1/system_config*', async route => {
            const url = route.request().url();
            const json = { value: '3.8' };
            await route.fulfill({ json });
        });

        // Mock Edge Function for SWIFT details
        await page.route('**/functions/v1/get-bank-transfer-details', async route => {
            const json = { bank_name: 'Skhy AI Global Bank', account_number: '1234567890' };
            await route.fulfill({ json });
        });
    });

    const seedGuestCart = async (page: Page) => {
        await page.addInitScript(() => {
            const mockItems = [{
                id: 'test-item-1',
                product_id: 1,
                quantity: 1,
                unit_price: 100,
                product: {
                    id: 1,
                    name: 'Test Product',
                    description: 'A test product',
                    seller_name: 'Test Seller',
                    stock_quantity: 10,
                    user_id: 'seller-123',
                    base_price: 100
                }
            }];
            localStorage.setItem('guest_cart', JSON.stringify(mockItems));
        });
    };

    test.skip('should show empty cart message when no items', async ({ page }) => {
        // Ensure cart is empty
        await page.addInitScript(() => localStorage.removeItem('guest_cart'));
        await page.goto('/checkout');
        await expect(page.getByText('Your cart is empty')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Return to Marketplace' })).toBeVisible();
    });

    test('should display platform fees correctly', async ({ page }) => {
        await seedGuestCart(page);
        await page.goto('/checkout');

        // Wait for cart calculation
        // Subtotal: 100, Fee: 3.8% = 3.80
        // Wait for cart calculation
        // Subtotal: 100, Fee: 3.8% = 3.80
        await expect(page.getByText(/Platform Fee/)).toBeVisible();
        await expect(page.getByText('$3.80')).toBeVisible();
    });

    test('should allow switching to SWIFT payment', async ({ page }) => {
        await seedGuestCart(page);
        await page.goto('/checkout');

        // Fill Address to proceed to next step
        await page.getByPlaceholder('Full Name').fill('John Doe');
        await page.getByPlaceholder('Address Line 1').fill('123 Test St');
        await page.getByPlaceholder('City').fill('Test City');
        await page.getByPlaceholder('State / Province').fill('TS');
        await page.getByPlaceholder('Postal Code').fill('12345');
        await page.getByPlaceholder('Country').fill('United States');

        // Click Continue to Shipping
        await page.getByRole('button', { name: /continue to shipping/i }).click();

        // Click Continue to Payment
        await page.getByRole('button', { name: /continue to payment/i }).click();

        // Check default is Credit Card or verify toggle exists

        // Switch to SWIFT
        await page.getByText('SWIFT / Bank Transfer').click();

        // Verify Bank Details are shown
        await expect(page.getByText('Bank Name:')).toBeVisible();
        await expect(page.getByText('Skhy AI Global Bank')).toBeVisible();

        // Verify Order Note is present
        await expect(page.getByPlaceholder('Special instructions')).toBeVisible();
    });

    test('should block checkout for restricted countries', async ({ page }) => {
        // Mock the User/Partner query to return restricted countries
        await page.route('**/rest/v1/users*', async route => {
            const json = [{
                user_id: 'seller-123',
                company_name: 'Test Seller',
                restricted_countries: ['North Korea']
            }];
            await route.fulfill({ json });
        });

        await seedGuestCart(page);
        await page.goto('/checkout');

        // Fill Address with Restricted Country
        await page.getByPlaceholder('Full Name').fill('Restricted User');
        await page.getByPlaceholder('Address Line 1').fill('123 Restricted St');
        await page.getByPlaceholder('City').fill('Pyongyang');
        await page.getByPlaceholder('State / Province').fill('Pyongyang');
        await page.getByPlaceholder('Postal Code').fill('12345');
        await page.getByPlaceholder('Country').fill('North Korea');

        // Attempt to continue
        await page.getByRole('button', { name: /continue to shipping/i }).click();

        // Verify Validation Error
        await expect(page.getByText(/cannot be shipped to North Korea/i)).toBeVisible();
    });
});
