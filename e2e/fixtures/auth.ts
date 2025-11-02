import { test as base, expect } from '@playwright/test';
import { AuthHelpers, TestHelpers } from '../utils/test-helpers';
import { TestData } from '../utils/selectors';

/**
 * Authentication fixtures for Blok E2E tests
 * Provides reusable authenticated state to avoid repeated logins
 */

type AuthFixtures = {
  authHelpers: AuthHelpers;
  testHelpers: TestHelpers;
  authenticatedPage: typeof base.extend;
};

/**
 * Base test with helper utilities injected
 */
export const test = base.extend<AuthFixtures>({
  // Inject AuthHelpers for every test
  authHelpers: async ({ page }, use) => {
    const authHelpers = new AuthHelpers(page);
    await use(authHelpers);
  },

  // Inject TestHelpers for every test
  testHelpers: async ({ page }, use) => {
    const testHelpers = new TestHelpers(page);
    await use(testHelpers);
  },

  // Pre-authenticated page fixture (login once, reuse)
  authenticatedPage: async ({ page }, use) => {
    const authHelpers = new AuthHelpers(page);

    // Check if test credentials are available
    if (!TestData.testUser.email || !TestData.testUser.password) {
      throw new Error(
        'Test credentials not found. Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables.'
      );
    }

    // Login
    await authHelpers.login(TestData.testUser.email, TestData.testUser.password);

    // Verify authentication
    const isAuth = await authHelpers.isAuthenticated();
    expect(isAuth).toBe(true);

    // Provide authenticated page to test
    await use(base.extend as any);

    // Cleanup: logout after test
    try {
      await authHelpers.logout();
    } catch {
      // Ignore logout errors
    }
  },
});

export { expect };
