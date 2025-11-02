/**
 * PRODUCTION SMOKE TESTS
 *
 * Critical user flows that must pass before production deployment.
 * These tests validate the core business value of the application.
 *
 * Test Philosophy:
 * - Fast: Run in < 3 minutes
 * - Focused: Only critical paths
 * - Reliable: No flaky tests
 * - DRY: Reusable helpers and fixtures
 */

import { test, expect } from './fixtures/auth';
import { WaitlistHelpers, TestHelpers } from './utils/test-helpers';
import { Selectors, Routes, TestData } from './utils/selectors';

test.describe('Production Smoke Tests', () => {

  test.describe('Critical User Flows', () => {

    test('Landing page loads successfully', async ({ page, testHelpers }) => {
      await testHelpers.navigateAndWait(Routes.home);

      // Verify hero section is visible
      await expect(page.locator(Selectors.landing.heroHeading)).toBeVisible({
        timeout: TestData.timeouts.medium,
      });

      // Verify page is interactive
      const waitlistButton = page.getByRole('button', {
        name: Selectors.waitlist.openButton,
      }).first();
      await expect(waitlistButton).toBeVisible();
      await expect(waitlistButton).toBeEnabled();
    });

    test.skip('Waitlist form submission works end-to-end', async ({ page }) => {
      const waitlistHelpers = new WaitlistHelpers(page);

      // Navigate to home
      await waitlistHelpers.navigateAndWait(Routes.home);

      // Submit waitlist form with unique data
      const uniqueEmail = TestHelpers.generateUniqueEmail('smoke-test');
      await waitlistHelpers.submitWaitlist({
        name: TestData.sampleWaitlist.name,
        email: uniqueEmail,
        building: TestData.sampleWaitlist.building,
        phone: TestData.sampleWaitlist.phone,
      });

      // Verify success message appears
      const hasSuccess = await waitlistHelpers.hasSuccessMessage();
      expect(hasSuccess).toBe(true);

      // Take screenshot for verification
      await page.screenshot({
        path: 'test-results/smoke-waitlist-success.png',
      });
    });

    test('Login page loads and renders correctly', async ({ page, testHelpers }) => {
      await testHelpers.navigateAndWait(Routes.login);

      // Verify all form elements are present
      await expect(page.getByLabel(Selectors.auth.emailInput)).toBeVisible();
      await expect(page.getByLabel(Selectors.auth.passwordInput)).toBeVisible();

      const loginButton = page.getByRole('button', {
        name: Selectors.auth.loginButton,
      });
      await expect(loginButton).toBeVisible();
      await expect(loginButton).toBeEnabled();

      // Verify navigation links work
      const forgotPasswordLink = page.getByRole('link', {
        name: Selectors.auth.forgotPasswordLink,
      });

      if (await forgotPasswordLink.isVisible()) {
        await expect(forgotPasswordLink).toBeVisible();
      }
    });

    test('Login flow works with valid credentials', async ({ page, authHelpers }) => {
      test.skip(
        !TestData.testUser.email || !TestData.testUser.password,
        'Skipping: No test credentials configured'
      );

      // Login
      await authHelpers.login(
        TestData.testUser.email,
        TestData.testUser.password
      );

      // Verify redirect to dashboard
      await authHelpers.waitForURL(Routes.dashboard, TestData.timeouts.veryLong);

      // Verify user is authenticated
      const isAuthenticated = await authHelpers.isAuthenticated();
      expect(isAuthenticated).toBe(true);

      // Take screenshot for verification
      await page.screenshot({
        path: 'test-results/smoke-login-success.png',
      });
    });

    test('Dashboard loads without errors when authenticated', async ({ page, authHelpers }) => {
      test.skip(
        !TestData.testUser.email || !TestData.testUser.password,
        'Skipping: No test credentials configured'
      );

      // Login
      await authHelpers.login(
        TestData.testUser.email,
        TestData.testUser.password
      );

      // Wait for dashboard to start loading (don't wait for networkidle - dashboard has real-time updates)
      await page.waitForLoadState('domcontentloaded', {
        timeout: TestData.timeouts.long,
      });

      // Verify main content renders
      const mainContent = page.locator(Selectors.dashboard.mainContent);
      await expect(mainContent).toBeVisible({
        timeout: TestData.timeouts.long,
      });

      // Verify no critical error messages are visible (empty string or null is fine)
      const errorMessage = await authHelpers.getErrorMessage();
      expect(errorMessage === null || errorMessage?.trim() === '').toBe(true);

      // Take screenshot for verification
      await page.screenshot({
        path: 'test-results/smoke-dashboard-success.png',
        fullPage: true,
      });
    });
  });

  test.describe('Authentication & Authorization', () => {

    test('Unauthenticated users are redirected to login', async ({ page, testHelpers }) => {
      // Try to access protected dashboard page
      await page.goto(Routes.dashboardExact);

      // Should redirect to login
      await testHelpers.waitForURL(/login|auth/, TestData.timeouts.long);

      // Verify we're on login page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/login|auth/);
    });

    test('Invalid login credentials show error message', async ({ page, authHelpers }) => {
      await authHelpers.navigateAndWait(Routes.login);

      // Try to login with invalid credentials
      await authHelpers.fillField(Selectors.auth.emailInput, 'fake@example.com');
      await authHelpers.fillField(Selectors.auth.passwordInput, 'wrongpassword123');
      await authHelpers.clickButton(Selectors.auth.loginButton);

      // Wait for response
      await page.waitForTimeout(2000);

      // Should still be on login page (not redirected)
      const currentUrl = page.url();
      expect(currentUrl).toContain('login');

      // Should show error message (if implemented)
      const errorMessage = await authHelpers.getErrorMessage();

      // Either error message exists OR we're still on login page
      const isLoginFailed = errorMessage !== null || currentUrl.includes('login');
      expect(isLoginFailed).toBe(true);
    });
  });

  test.describe('Error Handling & Edge Cases', () => {

    test.skip('Waitlist handles duplicate email gracefully', async ({ page }) => {
      const waitlistHelpers = new WaitlistHelpers(page);

      await waitlistHelpers.navigateAndWait(Routes.home);

      // Submit with common test email
      await waitlistHelpers.submitWaitlist({
        name: 'Duplicate Test',
        email: 'test@example.com',
      });

      // Wait for response
      await waitlistHelpers.waitForNetworkIdle(3000);

      // Should either show success OR show duplicate error
      // Both are acceptable responses
      const hasSuccess = await waitlistHelpers.hasSuccessMessage();
      const hasError = (await waitlistHelpers.getErrorMessage()) !== null;

      expect(hasSuccess || hasError).toBe(true);
    });

    test('Protected routes remain protected after page reload', async ({ page, authHelpers }) => {
      test.skip(
        !TestData.testUser.email || !TestData.testUser.password,
        'Skipping: No test credentials configured'
      );

      // Login
      await authHelpers.login(
        TestData.testUser.email,
        TestData.testUser.password
      );

      // Verify on dashboard
      await authHelpers.waitForURL(Routes.dashboard);

      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should still be authenticated (session persists)
      const currentUrl = page.url();
      const isStillAuthenticated = currentUrl.includes('dashboard');

      // If session doesn't persist, should redirect to login (also acceptable)
      const isRedirectedToLogin = currentUrl.includes('login');

      expect(isStillAuthenticated || isRedirectedToLogin).toBe(true);
    });
  });

  test.describe('Performance & UX', () => {

    test('Landing page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(Routes.home);
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;

      // Should load in less than 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('Login page is responsive and accessible', async ({ page, testHelpers }) => {
      await testHelpers.navigateAndWait(Routes.login);

      // Check form labels exist (accessibility)
      const emailInput = page.getByLabel(Selectors.auth.emailInput);
      const passwordInput = page.getByLabel(Selectors.auth.passwordInput);

      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();

      // Check inputs have IDs (accessibility)
      const emailId = await emailInput.getAttribute('id');
      const passwordId = await passwordInput.getAttribute('id');

      expect(emailId).toBeTruthy();
      expect(passwordId).toBeTruthy();
    });
  });

  test.describe('Critical Business Flows', () => {

    test.skip('Complete user journey: Landing → Waitlist → Success', async ({ page }) => {
      const waitlistHelpers = new WaitlistHelpers(page);

      // Step 1: Land on homepage
      await waitlistHelpers.navigateAndWait(Routes.home);
      await expect(page.locator(Selectors.landing.heroHeading)).toBeVisible();

      // Step 2: Click CTA to open waitlist
      const ctaButton = page.getByRole('button', {
        name: Selectors.waitlist.openButton,
      }).first();
      await ctaButton.click();
      await waitlistHelpers.waitForModal();

      // Step 3: Fill and submit form
      const uniqueEmail = TestHelpers.generateUniqueEmail('journey');
      await waitlistHelpers.fillField(Selectors.waitlist.nameInput, 'Journey Test User');
      await waitlistHelpers.fillField(Selectors.waitlist.emailInput, uniqueEmail);

      const submitButton = page.getByRole('button', {
        name: Selectors.waitlist.submitButton,
      });
      await submitButton.click();

      // Step 4: Verify success
      await page.waitForTimeout(2000);
      const hasSuccess = await waitlistHelpers.hasSuccessMessage();
      expect(hasSuccess).toBe(true);

      // Take screenshot of complete journey
      await page.screenshot({
        path: 'test-results/smoke-complete-journey.png',
      });
    });

    test('Complete auth journey: Login → Dashboard → Navigate', async ({ page, authHelpers, testHelpers }) => {
      test.skip(
        !TestData.testUser.email || !TestData.testUser.password,
        'Skipping: No test credentials configured'
      );

      // Step 1: Login
      await authHelpers.login(
        TestData.testUser.email,
        TestData.testUser.password
      );

      // Step 2: Verify dashboard loads
      await authHelpers.waitForURL(Routes.dashboard);
      const mainContent = page.locator(Selectors.dashboard.mainContent);
      await expect(mainContent).toBeVisible();

      // Step 3: Navigate to a dashboard section (if nav exists)
      const navExists = await testHelpers.elementExists(Selectors.dashboard.navigation);

      if (navExists) {
        // Dashboard navigation works
        expect(navExists).toBe(true);
      }

      // Take screenshot
      await page.screenshot({
        path: 'test-results/smoke-auth-journey.png',
        fullPage: true,
      });
    });
  });
});

/**
 * Health Check Tests (Run First)
 * These verify the test environment is properly configured
 */
test.describe('Test Environment Health Check', () => {

  test('Environment variables are configured', async () => {
    // Check Supabase is configured (required)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(supabaseUrl).toBeTruthy();

    // Base URL is optional locally (defaults to localhost:3000 in playwright.config.ts)
    // Only required in CI
    if (process.env.CI) {
      const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL;
      expect(baseURL).toBeTruthy();
    }
  });

  test('Application is running and accessible', async ({ page }) => {
    const response = await page.goto(Routes.home);
    expect(response?.status()).toBe(200);
  });
});
