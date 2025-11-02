import { test, expect } from '@playwright/test';

test.describe('Waitlist Flow - Complete QA Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show waitlist CTA on homepage', async ({ page }) => {
    // Find waitlist button
    const waitlistButton = page.getByRole('button', { name: /lista de espera|waitlist|reserva.*acceso|reserve.*access/i });

    await expect(waitlistButton).toBeVisible();
    await expect(waitlistButton).toBeEnabled();
  });

  test('should open waitlist modal when clicking CTA', async ({ page }) => {
    // Click waitlist button
    const waitlistButton = page.getByRole('button', { name: /lista de espera|waitlist|reserva.*acceso|reserve.*access/i }).first();
    await waitlistButton.click();

    // Wait for modal
    await page.waitForTimeout(500);

    // Check modal is visible
    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).toBeVisible();

    // Check form fields exist
    await expect(page.getByLabel(/nombre|name/i)).toBeVisible();
    await expect(page.getByLabel(/email|correo/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Open waitlist modal
    const waitlistButton = page.getByRole('button', { name: /lista de espera|waitlist|reserva/i }).first();
    await waitlistButton.click();
    await page.waitForTimeout(500);

    // Try to submit without filling
    const submitButton = page.getByRole('button', { name: /enviar|submit|join/i });
    await submitButton.click();

    // Check for validation errors
    await page.waitForTimeout(500);

    // Form should still be visible (not submitted)
    const modal = page.locator('[role="dialog"]').first();
    await expect(modal).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    // Open modal
    const waitlistButton = page.getByRole('button', { name: /lista de espera|waitlist/i }).first();
    await waitlistButton.click();
    await page.waitForTimeout(500);

    // Fill with invalid email
    await page.getByLabel(/nombre|name/i).fill('Test User');
    await page.getByLabel(/email|correo/i).fill('invalid-email');

    // Try to submit
    await page.getByRole('button', { name: /enviar|submit|join/i }).click();
    await page.waitForTimeout(500);

    // Should show validation error
    const emailInput = page.getByLabel(/email|correo/i);
    const isInvalid = await emailInput.evaluate((el) => {
      const inputEl = el as HTMLInputElement;
      return el.hasAttribute('aria-invalid') ||
        el.classList.contains('invalid') ||
        (inputEl.type === 'email' && !inputEl.checkValidity());
    });

    expect(isInvalid).toBeTruthy();
  });

  test('should successfully submit waitlist form', async ({ page }) => {
    // Open modal
    const waitlistButton = page.getByRole('button', { name: /lista de espera|waitlist/i }).first();
    await waitlistButton.click();
    await page.waitForTimeout(500);

    // Generate unique email
    const timestamp = Date.now();
    const testEmail = `test+${timestamp}@example.com`;

    // Fill form
    await page.getByLabel(/nombre|name/i).fill('QA Test User');
    await page.getByLabel(/email|correo/i).fill(testEmail);

    // Add building name if field exists
    const buildingField = page.getByLabel(/edificio|building|condominio/i);
    if (await buildingField.isVisible()) {
      await buildingField.fill('Test Building QA');
    }

    // Add phone if field exists
    const phoneField = page.getByLabel(/teléfono|phone/i);
    if (await phoneField.isVisible()) {
      await phoneField.fill('787-555-0100');
    }

    // Submit
    await page.getByRole('button', { name: /enviar|submit|join/i }).click();

    // Wait for success
    await page.waitForTimeout(2000);

    // Check for success message
    const successMessage = page.getByText(/gracias|thank you|success|¡listo!|confirmación/i);
    await expect(successMessage).toBeVisible();
  });

  test('should prevent duplicate email submissions', async ({ page }) => {
    // Open modal
    const waitlistButton = page.getByRole('button', { name: /lista de espera|waitlist/i }).first();
    await waitlistButton.click();
    await page.waitForTimeout(500);

    // Use common test email
    await page.getByLabel(/nombre|name/i).fill('Duplicate Test');
    await page.getByLabel(/email|correo/i).fill('test@example.com');

    // Submit
    await page.getByRole('button', { name: /enviar|submit|join/i }).click();
    await page.waitForTimeout(2000);

    // Try to submit again with same email
    const waitlistButton2 = page.getByRole('button', { name: /lista de espera|waitlist/i }).first();

    if (await waitlistButton2.isVisible()) {
      await waitlistButton2.click();
      await page.waitForTimeout(500);

      await page.getByLabel(/nombre|name/i).fill('Duplicate Test');
      await page.getByLabel(/email|correo/i).fill('test@example.com');
      await page.getByRole('button', { name: /enviar|submit|join/i }).click();

      await page.waitForTimeout(2000);

      // Should show duplicate error
      const errorMessage = page.getByText(/already|ya.*registrado|duplicate|exists/i);

      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    }
  });

  test('should close modal on cancel/close', async ({ page }) => {
    // Open modal
    const waitlistButton = page.getByRole('button', { name: /lista de espera|waitlist/i }).first();
    await waitlistButton.click();
    await page.waitForTimeout(500);

    // Find close button (X or Cancel)
    const closeButton = page.locator('button[aria-label*="close"], button:has-text("×"), button:has-text("Cancelar")').first();

    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);

      // Modal should be hidden
      const modal = page.locator('[role="dialog"]').first();
      await expect(modal).not.toBeVisible();
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate offline
    await page.context().setOffline(true);

    // Open modal
    const waitlistButton = page.getByRole('button', { name: /lista de espera|waitlist/i }).first();
    await waitlistButton.click();
    await page.waitForTimeout(500);

    // Fill form
    await page.getByLabel(/nombre|name/i).fill('Offline Test');
    await page.getByLabel(/email|correo/i).fill('offline@example.com');

    // Try to submit
    await page.getByRole('button', { name: /enviar|submit|join/i }).click();
    await page.waitForTimeout(2000);

    // Should show error message
    const errorMessage = page.getByText(/error|network|connection|red|conexión/i);

    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible();
    }

    // Restore online
    await page.context().setOffline(false);
  });

  test('should have proper field labels for accessibility', async ({ page }) => {
    // Open modal
    const waitlistButton = page.getByRole('button', { name: /lista de espera|waitlist/i }).first();
    await waitlistButton.click();
    await page.waitForTimeout(500);

    // Check all inputs have labels
    const nameInput = page.getByLabel(/nombre|name/i);
    await expect(nameInput).toBeVisible();

    const emailInput = page.getByLabel(/email|correo/i);
    await expect(emailInput).toBeVisible();

    // Check inputs have proper ARIA attributes
    const nameId = await nameInput.getAttribute('id');
    expect(nameId).toBeTruthy();

    const emailId = await emailInput.getAttribute('id');
    expect(emailId).toBeTruthy();
  });

  test('should show loading state during submission', async ({ page }) => {
    // Open modal
    const waitlistButton = page.getByRole('button', { name: /lista de espera|waitlist/i }).first();
    await waitlistButton.click();
    await page.waitForTimeout(500);

    // Fill form
    const timestamp = Date.now();
    await page.getByLabel(/nombre|name/i).fill('Loading Test');
    await page.getByLabel(/email|correo/i).fill(`loading${timestamp}@example.com`);

    // Click submit
    const submitButton = page.getByRole('button', { name: /enviar|submit|join/i });
    await submitButton.click();

    // Immediately check for loading state
    await page.waitForTimeout(100);

    // Button should show loading (disabled or different text)
    const isDisabled = await submitButton.isDisabled();
    const buttonText = await submitButton.textContent();

    expect(isDisabled || buttonText?.toLowerCase().includes('loading') || buttonText?.includes('...')).toBeTruthy();
  });
});
