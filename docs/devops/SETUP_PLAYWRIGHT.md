# Playwright Setup and Testing Guide

Playwright is a powerful framework for end-to-end (E2E) testing across all modern rendering engines including Chromium (Chrome/Edge), WebKit (Safari), and Firefox. This guide explains how to configure Playwright for different browsers and how to write various test scenarios.

## 1. Initial Setup

If Playwright is not yet fully initialized, run the following commands in the root of your project:

```bash
# Install Playwright test package
npm install -D @playwright/test

# Install browser binaries and their dependencies (Chromium, Firefox, WebKit)
npx playwright install --with-deps

# Optional: Install Node types if not already present
npm i --save-dev @types/node
```

## 2. Configuration (`playwright.config.ts`)

Playwright is configured via `playwright.config.ts`. Here, you define projects, which allow you to specify different browser environments and mobile emulators.

Here is an example setup demonstrating multiple configurations:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    
    // Shared settings for all the projects below
    use: {
        baseURL: 'http://localhost:5173',
        trace: 'on-first-retry',
        // Example: You can set a custom locale or timezone globally here
        // locale: 'de-DE',
        // timezoneId: 'Europe/Berlin',
    },

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        // --- Mobile Environments ---
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
        // --- Specific Edge Cases / Strict Modes ---
        {
            name: 'Mobile Safari (Strict constraints)',
            use: { 
                ...devices['iPhone 13'],
                // You can add additional configuration here specific to strict testing
            },
        },
    ],

    // Run your local dev server before starting the tests
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
    },
});
```

## 3. Writing Test Scenarios

Tests are typically written inside the `e2e` or `tests` directory.

### Scenario A: Testing Browser Compatibility (Safe Storage wrapper)

You can use Playwright to simulate extreme browser configurations, such as Safari blocking `localStorage` in private mode. By checking the `browserName`, you can inject specific scripts to test your fallback logic.

```typescript
// e2e/compatibility.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Browser Compatibility Edge Cases', () => {
  test('Should load silently when storage API throws SecurityError', async ({ page, browserName }) => {
    
    // Emulate strict storage block in Safari/WebKit
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

    await page.goto('/');

    // Ensure the ErrorBoundary did not catch an unhandled throw
    const errorHeading = page.locator('text=Something went wrong');
    await expect(errorHeading).not.toBeVisible();

    // Ensure content loaded successfully
    await expect(page.locator('text=Skhy AI Marketplace')).toBeVisible();
  });
});
```

### Scenario B: Testing User Authentication

A standard E2E test verifying a user flow, like logging in. Note the use of `locator` and `fill`.

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('User can log in successfully', async ({ page }) => {
  await page.goto('/login');

  // Fill out the form
  await page.locator('input[type="email"]').fill('test@example.com');
  await page.locator('input[type="password"]').fill('password123');
  
  // Click submit
  await page.locator('button[type="submit"]').click();

  // Verify successful redirection or UI update
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Welcome back, test')).toBeVisible();
});
```

### Scenario C: Testing Responsiveness (Mobile Menus)

With Playwright's mobile emulation, you can test UI elements that only appear on small screens. Playwright's device profiles automatically set the viewport size.

```typescript
// e2e/responsive.spec.ts
import { test, expect } from '@playwright/test';

test('Mobile navigation menu works', async ({ page, isMobile }) => {
  // We can skip this test if the current configuration is not mobile
  test.skip(!isMobile, 'This test is only relevant for mobile devices');

  await page.goto('/');

  // On mobile, the normal nav is hidden and a hamburger icon is visible
  const hamburgerMenu = page.locator('button[aria-label="Open navigation"]');
  await expect(hamburgerMenu).toBeVisible();

  // Click the menu and verify links appear
  await hamburgerMenu.click();
  const mobileNav = page.locator('.mobile-nav-container');
  await expect(mobileNav).toBeVisible();
  
  await expect(mobileNav.locator('text=Marketplace')).toBeVisible();
});
```

## 4. Running Tests

Playwright provides robust CLI tools for running tests. Add these command shortcuts to your `package.json` under `"scripts"`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:watch": "playwright test --ui",
    "test:e2e:webkit": "playwright test --project=webkit"
  }
}
```

### Command Reference

*   `npm run test:e2e` (or `npx playwright test`)
    Runs all tests across all configured projects (browsers) headlessly.
*   `npm run test:e2e:watch` (or `npx playwright test --ui`)
    Opens Playwright's excellent **UI mode**. This allows you to explore tests, view a timeline of every click and network request, and automatically re-run tests when you save changes (Watch mode).
*   `npx playwright test --project=webkit`
    Runs tests only in a specific project (e.g., just WebKit to isolate iOS/Safari bugs).
*   `npx playwright test --headed`
    Runs the tests while actually opening browser windows so you can visually watch the automation.
*   `npx playwright test --debug`
    Runs the tests in debug mode, allowing you to step through automation lines one by one.

## 5. Artifacts and Reporting

When running centrally (e.g., via `npm run test:e2e`), Playwright outputs reports by default.

*   **Test Reports**: If tests fail, you can view the detailed HTML report using:
    `npx playwright show-report`
*   **Traces**: Playwright captures DOM snapshots at every execution step. You can view these traces via the HTML report or UI mode to "time-travel" through a failed test scenario and see exactly what the DOM looked like.

## 6. Advanced Testing Strategies

### Using the Page Object Model (POM)

For larger applications, it is highly recommended to use the Page Object Model pattern. This extracts the UI locators and actions into a separate class, making tests much easier to read and maintain.

**Creating a Page Object (`e2e/pages/LoginPage.ts`):**
```typescript
import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

**Using the Page Object in a Test (`e2e/auth-pom.spec.ts`):**
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('User can log in using POM', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.goto();
  await loginPage.login('test@example.com', 'mypassword123');
  
  await expect(page).toHaveURL('/dashboard');
});
```

### Mocking Network Requests

Often, you want to test how your UI behaves when an API fails or returns unexpected data, without actually hitting the real backend (like Supabase or Stripe).

```typescript
// e2e/network-mock.spec.ts
import { test, expect } from '@playwright/test';

test('Shows error message when API fails', async ({ page }) => {
  // Intercept the API call and return a mocked 500 error response
  await page.route('**/api/v1/products*', async route => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });
  });

  await page.goto('/marketplace');

  // Verify the UI handles the error gracefully
  await expect(page.locator('text=Failed to load products')).toBeVisible();
});
```

## 7. CI/CD Integration (GitHub Actions)

Playwright is designed to run in CI/CD pipelines. Here is a sample GitHub Actions workflow (`.github/workflows/playwright.yml`) to run tests automatically on every Push or Pull Request:

```yaml
name: Playwright Tests
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
    
    - name: Install dependencies
      run: npm ci
      
    - name: Ensure Vite is built 
      run: npm run build
      
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
      
    - name: Run Playwright tests
      run: npx playwright test
      
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```
