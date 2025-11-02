import { Page, expect } from '@playwright/test';
import { Selectors } from './selectors';

/**
 * Test utilities for Blok E2E tests
 * Provides reusable helper functions following DRY principles
 */

export class TestHelpers {
  constructor(protected page: Page) {}

  /**
   * Wait for page to be fully loaded (network idle)
   */
  async waitForPageLoad(timeout = 10000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Wait for page to be ready for interaction
   */
  async waitForPageReady(timeout = 5000) {
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * Navigate to a route and wait for it to load
   */
  async navigateAndWait(path: string, timeout = 10000) {
    await this.page.goto(path);
    await this.waitForPageReady(timeout);
  }

  /**
   * Fill form field by label with proper error handling
   */
  async fillField(labelPattern: RegExp | string, value: string) {
    const field = this.page.getByLabel(labelPattern);
    await expect(field).toBeVisible({ timeout: 5000 });
    await field.fill(value);
  }

  /**
   * Click button by text/name with proper error handling
   */
  async clickButton(namePattern: RegExp | string, options?: { timeout?: number }) {
    const button = this.page.getByRole('button', { name: namePattern });
    await expect(button).toBeVisible({ timeout: options?.timeout ?? 5000 });
    await expect(button).toBeEnabled();
    await button.click();
  }

  /**
   * Wait for text to appear on page
   */
  async waitForText(pattern: RegExp | string, timeout = 5000) {
    const element = this.page.getByText(pattern);
    await expect(element).toBeVisible({ timeout });
  }

  /**
   * Wait for URL to match pattern
   */
  async waitForURL(pattern: RegExp | string, timeout = 10000) {
    await expect(this.page).toHaveURL(pattern, { timeout });
  }

  /**
   * Generate unique email for testing
   */
  static generateUniqueEmail(prefix = 'test'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${prefix}+${timestamp}${random}@example.com`;
  }

  /**
   * Check if element exists (without throwing)
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'attached', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Take screenshot with timestamp
   */
  async takeDebugScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    await this.page.screenshot({
      path: `test-results/debug-${name}-${timestamp}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for modal/dialog to open
   */
  async waitForModal(timeout = 3000) {
    const modal = this.page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).toBeVisible({ timeout });
  }

  /**
   * Close modal/dialog
   */
  async closeModal() {
    const closeButton = this.page.locator(
      'button[aria-label*="close"], button:has-text("×"), button:has-text("Cancelar"), button:has-text("Cancel")'
    ).first();

    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  /**
   * Check for error messages on page
   */
  async getErrorMessage(): Promise<string | null> {
    const errorPatterns = [
      /error|incorrect|invalid|wrong|inválid|incorrecto/i,
      '.text-destructive',
      '[class*="error"]',
      '[role="alert"]',
    ];

    for (const pattern of errorPatterns) {
      const errorElement = typeof pattern === 'string'
        ? this.page.locator(pattern).first() // Use first() to avoid strict mode violations
        : this.page.getByText(pattern);

      try {
        if (await errorElement.isVisible({ timeout: 1000 })) {
          return await errorElement.textContent();
        }
      } catch {
        // Element not visible or timeout, continue to next pattern
        continue;
      }
    }

    return null;
  }

  /**
   * Check for success messages on page
   */
  async hasSuccessMessage(): Promise<boolean> {
    const successPatterns = [
      /gracias|thank you|success|éxito|confirmación|listo/i,
      '.text-green',
      '[class*="success"]',
    ];

    for (const pattern of successPatterns) {
      const element = typeof pattern === 'string'
        ? this.page.locator(pattern)
        : this.page.getByText(pattern);

      if (await element.isVisible()) {
        return true;
      }
    }

    return false;
  }

  /**
   * Wait for network to be idle (useful after form submissions)
   */
  async waitForNetworkIdle(timeout = 5000) {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Retry an action if it fails
   */
  async retryAction<T>(
    action: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await this.page.waitForTimeout(delayMs);
        }
      }
    }

    throw lastError;
  }
}

/**
 * Authentication helpers
 */
export class AuthHelpers extends TestHelpers {
  /**
   * Login with credentials
   */
  async login(email: string, password: string) {
    await this.navigateAndWait('/login');
    await this.fillField(/email|correo/i, email);
    await this.fillField(/password|contraseña/i, password);
    await this.clickButton(/log in|iniciar sesión|sign in/i);

    // Wait for redirect to dashboard
    await this.waitForURL(/dashboard/, 15000);
  }

  /**
   * Logout (if logout button exists)
   */
  async logout() {
    const logoutButton = this.page.getByRole('button', { name: /log out|cerrar sesión|salir/i });

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await this.waitForURL(/login|^\/$/, 5000);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const currentUrl = this.page.url();
    return currentUrl.includes('/dashboard');
  }
}

/**
 * Waitlist form helpers
 */
export class WaitlistHelpers extends TestHelpers {
  /**
   * Submit waitlist form
   */
  async submitWaitlist(data: {
    name: string;
    email: string;
    building?: string;
    phone?: string;
  }) {
    // Open waitlist modal
    const waitlistButton = this.page.getByRole('button', {
      name: /lista de espera|waitlist|reserva.*acceso|reserve.*access/i,
    }).first();

    await expect(waitlistButton).toBeVisible({ timeout: 5000 });
    await waitlistButton.click();

    // Wait for modal
    await this.waitForModal();

    // Fill required fields
    await this.fillField(/nombre|name/i, data.name);
    await this.fillField(/email|correo/i, data.email);

    // Fill optional fields if they exist
    if (data.building) {
      const buildingField = this.page.getByLabel(/edificio|building|condominio/i);
      if (await buildingField.isVisible()) {
        await buildingField.fill(data.building);
      }
    }

    if (data.phone) {
      const phoneField = this.page.getByLabel(/teléfono|phone/i);
      if (await phoneField.isVisible()) {
        await phoneField.fill(data.phone);
      }
    }

    // Submit
    await this.clickButton(Selectors.waitlist.submitButton);

    // Wait for submission to complete (longer timeout for waitlist API)
    await this.page.waitForTimeout(2000);
    await this.waitForNetworkIdle(5000);
  }
}
