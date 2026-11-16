import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test.describe('Holistic Critical User Journey', () => {
    // Shared variables for the journey
    const uniqueId = randomUUID().substring(0, 8);
    const partnerEmail = `partner_${uniqueId}@gmail.com`;
    const password = 'Password123!';
    const companyName = `Test Company ${uniqueId}`;
    const productName = `Holistic AI Model ${uniqueId}`;

    test('Full Lifecycle: Partner Register -> Create Product -> Buyer Purchase', async ({ page }) => {
        // Increases timeout for this long flow
        test.setTimeout(120000);

        // ==========================================
        // MOCK AUTHENTICATION (Backend Validation Bypass)
        // ==========================================
        const mockUser = {
            id: 'mock-user-123',
            aud: 'authenticated',
            role: 'authenticated',
            email: partnerEmail,
            email_confirmed_at: '2023-01-01T00:00:00Z',
            app_metadata: { provider: 'email', providers: ['email'] },
            user_metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const mockSession = {
            access_token: 'mock-access-token.jwt.fake',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: mockUser,
        };

        // Mock Signup
        await page.route(/\/auth\/v1\/signup/, async route => {
            console.log(`Mocking signup request: ${route.request().url()}`);
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUser) });
        });

        // Mock Login (Token)
        await page.route(/\/auth\/v1\/token/, async route => {
            console.log(`Mocking token request: ${route.request().url()}`);
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSession) });
        });

        // Mock User Fetch (Auth API)
        await page.route(/\/auth\/v1\/user/, async route => {
            console.log(`Mocking user request: ${route.request().url()}`);
            await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockUser) });
        });

        // ==========================================
        // MOCK DATABASE (Bypass RLS/Backend Logic)
        // ==========================================

        // Mock Profile Fetch (users table)
        // Check if user exists (return empty initially to trigger onboarding, or return profile after onboarding)
        await page.route(/\/rest\/v1\/users\?/, async route => {
            console.log(`Mocking DB users fetch: ${route.request().url()}`);
            const method = route.request().method();
            if (method === 'GET') {
                // If checking for profile on dashboard load
                // We'll mimic dynamic behavior: if "onboarding completed" context? 
                // Hard to stateful mock in simple route handler without closure variable.
                // We'll return EMPTY array initially to force Onboarding check?
                // Or if accessing dashboard, return full profile?
                // Simple hack: Always return a profile that LOOKS completed, BUT let Onboarding flow enable it?
                // Wait, if we return completed profile, Onboarding might be skipped!
                // The test EXPECTS Onboarding. So first fetch (after login) should return EMPTY or INCOMPLETE.
                // But after Onboarding submit, subsequent fetches should return COMPLETE.

                // WE MUST RETURN A PROFILE with user_type: 'partner' so Login redirects to Partner flow.
                // But onboarding_complete must be false-y so it goes to /partner/onboarding.
                const mockProfile = {
                    user_id: mockUser.id,
                    user_metadata: { user_type: 'partner' }, // Missing onboarding_complete
                    user_role: 'partner'
                };
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([mockProfile]) });
            } else if (method === 'POST') {
                // Mock Onboarding Submit (Create Profile)
                console.log('Mocking DB users insert');
                await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([mockUser]) });
            } else {
                await route.continue();
            }
        });

        // Mock Products
        await page.route(/\/rest\/v1\/products/, async route => {
            const method = route.request().method();
            if (method === 'POST') {
                console.log('Mocking Product Create');
                const body = route.request().postDataJSON();
                const newProduct = { ...body, id: 12345, user_id: mockUser.id, created_at: new Date() };
                await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([newProduct]) });
            } else if (method === 'GET') {
                console.log('Mocking Marketplace Query');
                // Return our product
                const product = {
                    id: 12345,
                    name: productName,
                    description: 'State of the art holistic model.',
                    base_price: 500,
                    pricing_model: 'flat',
                    category: 'AI Models',
                    type: 'service',
                    user_id: mockUser.id,
                    seller: { company_name: companyName, seller_type: 'manufacturer' },
                    product_assets: [],
                    usage_rates: []
                };
                await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([product]) });
            } else {
                await route.continue();
            }
        });

        // Mock Orders
        await page.route(/\/rest\/v1\/orders/, async route => {
            if (route.request().method() === 'POST') {
                console.log('Mocking Order Create');
                await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([{ id: 'order-123' }]) });
            } else { await route.continue(); }
        });

        // Mock Order Items
        await page.route(/\/rest\/v1\/order_items/, async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' });
            } else { await route.continue(); }
        });

        // ==========================================
        // PART 1: PARTNER JOURNEY
        // ==========================================
        console.log(`Starting Partner Journey with ${partnerEmail}...`);

        // 1. Register
        console.log('Navigating to register...');
        await page.goto('/register?bypass_turnstile=true');

        console.log('Filling registration form...');
        // Register Form (corrected fields with exact labels to avoid ambiguity)
        await page.getByLabel('Email Address *').fill(partnerEmail);
        await page.getByLabel('Company Name *').fill(companyName);
        await page.getByLabel('Seller Type *').selectOption('manufacturer');
        await page.getByLabel('Password *', { exact: true }).fill(password);
        await page.getByLabel('Confirm Password *').fill(password);

        console.log('Submitting registration...');
        await page.getByRole('button', { name: /create account/i }).click();

        // 2. Login (Register redirects to Login after success)
        console.log('Waiting for login redirection and applying turnstile bypass...');
        await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
        await page.goto('/login?bypass_turnstile=true');

        // Verify successful registration by checking if we made it to login
        await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
        await page.getByLabel('Email Address').fill(partnerEmail);
        await page.getByLabel('Password').fill(password);
        // Ensure "Sign in" button is correct
        console.log('Clicking Sign In...');
        await page.getByRole('button', { name: /sign in/i }).click();

        // 3. Onboarding
        console.log('Waiting for onboarding redirect...');
        // Should be redirected to onboarding if profile incomplete
        // Note: verify if Login redirects to dashboard or onboarding.
        // If system checks for onboarding status, it should go to /partner/onboarding
        await expect(page).toHaveURL(/\/partner\/onboarding/, { timeout: 15000 });
        console.log('Onboarding page reached.');
        await expect(page.getByText('Partner Onboarding')).toBeVisible();

        // Fill Onboarding Form
        await page.getByLabel('Company Name').fill(companyName);
        await page.getByLabel('Website').fill('https://example.com');
        await page.getByLabel('Description').fill('A test AI company for E2E validation.');
        // Select logic might vary based on UI implementation, assuming standard selects
        await page.getByLabel('Industry').selectOption('Software'); // Adjust value if needed
        await page.getByLabel('Company Size').selectOption('1-10');

        // Address
        await page.getByLabel('Street Address').fill('123 Innovation Dr');
        await page.getByLabel('City').fill('Tech City');
        await page.getByLabel('State / Province').fill('CA');
        await page.getByLabel('Postal Code').fill('90210');
        await page.getByLabel('Country').fill('United States');

        await page.getByRole('button', { name: /complete onboarding/i }).click();

        // 3. Partner Dashboard & Product Creation
        await expect(page).toHaveURL(/\/partner\/dashboard/);
        await expect(page.getByText(companyName)).toBeVisible(); // Verify dashboard loaded

        // Navigate to Products
        await page.getByText('Product Management').click(); // Using text or link to nav
        // Alternatively if sidebar: await page.locator('a[href="/partner/products"]').click();

        // Add Product
        await page.getByRole('button', { name: /add product/i }).click();

        await page.getByPlaceholder('Product Name').fill(productName);
        await page.getByLabel('Category').selectOption('AI Models');
        await page.getByLabel('Type').selectOption('service'); // software/service/hardware
        await page.getByPlaceholder('Description').fill('State of the art holistic model.');

        // Pricing
        await page.getByPlaceholder('Base Price').fill('500');
        // If currency selector exists: await page.getByLabel('Currency').selectOption('USD');

        // Save
        await page.getByRole('button', { name: /create product/i }).click();

        // Verify Product Listed
        await expect(page.getByText(productName)).toBeVisible();

        // Logout
        // Assuming there is a logout button in navbar or profile menu
        // For robustness, clearing storage/cookies or clicking logout
        // await page.getByRole('button', { name: /logout/i }).click();
        // Or simpler for this test: Clear context storage to become anonymous
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
        await page.evaluate(() => sessionStorage.clear());


        // ==========================================
        // PART 2: BUYER JOURNEY (Anonymous)
        // ==========================================
        console.log('Starting Buyer Journey...');

        // 1. Browse Marketplace
        await page.goto('/marketplace');

        // Filter or Search for the product
        await page.getByPlaceholder('Search products...').fill(productName);
        // Wait for filtering network request or UI update
        await page.waitForTimeout(2000); // Debounce wait

        await expect(page.getByText(productName)).toBeVisible();

        // 2. Add to Cart (Find card with product name, then click Add)
        const productCard = page.locator('.bg-navy-800').filter({ hasText: productName });
        await productCard.getByRole('button', { name: /add to cart/i }).click();

        // Verify Cart Drawer/Modal or Notification
        // await expect(page.getByText('Shopping Cart')).toBeVisible();

        // 3. Checkout
        await page.goto('/checkout');

        // Check Item in Summary
        await expect(page.getByText(productName)).toBeVisible();

        // Fill Address
        await page.getByPlaceholder('Full Name').fill('John Doe');
        await page.getByPlaceholder('Address Line 1').fill('456 Buyer Lane');
        await page.getByPlaceholder('City').fill('New York');
        await page.getByPlaceholder('State / Province').fill('NY');
        await page.getByPlaceholder('Postal Code').fill('10001');
        await page.getByPlaceholder('Country').fill('United States');

        await page.getByRole('button', { name: /continue to shipping/i }).click();

        // Shipping Method (Default Standard)
        await expect(page.getByText('Shipping Method')).toBeVisible();
        await page.getByRole('button', { name: /continue to payment/i }).click();

        // Payment (Select Card Default)
        await expect(page.getByText('Payment')).toBeVisible();

        // Place Order
        await page.getByRole('button', { name: /place order/i }).click();

        // 4. Success Page
        await expect(page).toHaveURL(/\/checkout\/success/);
        await expect(page.getByText('Order Confirmed')).toBeVisible();

        console.log('Holistic User Journey Completed Successfully!');
    });
});
