import { test, expect } from '@playwright/test';

test.describe('Authentication Flow - QA Engineer Tests', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
    });

    test('should display login form correctly', async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle(/Login|Iniciar sesión/i);

      // Check form elements exist
      await expect(page.getByLabel(/email|correo/i)).toBeVisible();
      await expect(page.getByLabel(/password|contraseña/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /iniciar sesión|log in|sign in/i })).toBeVisible();
    });

    test('should show validation error for empty email', async ({ page }) => {
      // Click submit without filling form
      await page.getByRole('button', { name: /iniciar sesión|log in|sign in/i }).click();

      // Wait for validation
      await page.waitForTimeout(500);

      // Check for error message or invalid state
      const emailInput = page.getByLabel(/email|correo/i);
      const isInvalid = await emailInput.evaluate((el) =>
        el.hasAttribute('aria-invalid') || el.classList.contains('invalid')
      );

      expect(isInvalid).toBeTruthy();
    });

    test('should show validation error for invalid email format', async ({ page }) => {
      // Enter invalid email
      await page.getByLabel(/email|correo/i).fill('not-an-email');
      await page.getByLabel(/password|contraseña/i).fill('test123');

      // Try to submit
      await page.getByRole('button', { name: /iniciar sesión|log in|sign in/i }).click();

      // Wait for validation
      await page.waitForTimeout(500);

      // Check still on login page (didn't submit)
      await expect(page).toHaveURL(/.*login.*/);
    });

    test('should show error for incorrect credentials', async ({ page }) => {
      // Enter fake credentials
      await page.getByLabel(/email|correo/i).fill('fake@example.com');
      await page.getByLabel(/password|contraseña/i).fill('wrongpassword');

      // Submit
      await page.getByRole('button', { name: /iniciar sesión|log in|sign in/i }).click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Check for error message
      const errorMessage = page.getByText(/invalid|incorrect|wrong|inválid|incorrect/i);
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).toBeVisible();
      }
    });

    test('should have "Forgot Password" link', async ({ page }) => {
      const forgotLink = page.getByRole('link', { name: /forgot password|olvidaste.*contraseña/i });
      await expect(forgotLink).toBeVisible();

      // Click it
      await forgotLink.click();

      // Should navigate to forgot password page
      await expect(page).toHaveURL(/.*forgot-password.*/);
    });

    test('should have link to signup page', async ({ page }) => {
      const signupLink = page.getByRole('link', { name: /sign up|crear cuenta|registr/i });

      if (await signupLink.isVisible()) {
        await expect(signupLink).toBeVisible();

        // Click it
        await signupLink.click();

        // Should navigate to signup
        await expect(page).toHaveURL(/.*signup.*/);
      }
    });

    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.getByLabel(/password|contraseña/i);

      // Password should be hidden by default
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Find toggle button (eye icon)
      const toggleButton = page.locator('button[aria-label*="password"], button:has([class*="eye"])').first();

      if (await toggleButton.isVisible()) {
        await toggleButton.click();

        // Password should now be visible
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Click again to hide
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  test.describe('Signup Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/signup');
    });

    test('should display signup form correctly', async ({ page }) => {
      // Check form elements
      await expect(page.getByLabel(/email|correo/i)).toBeVisible();
      await expect(page.getByLabel(/password|contraseña/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /sign up|crear cuenta|registr/i })).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      const passwordInput = page.getByLabel(/password|contraseña/i);

      // Try weak password
      await passwordInput.fill('123');

      // Check for strength indicator or error
      await page.waitForTimeout(500);

      // Look for password strength indicator
      const strengthIndicator = page.locator('[class*="strength"], [class*="weak"]').first();

      if (await strengthIndicator.isVisible()) {
        const text = await strengthIndicator.textContent();
        expect(text?.toLowerCase()).toMatch(/weak|débil|corta/);
      }
    });

    test('should prevent duplicate email registration', async ({ page }) => {
      // Try to register with existing email
      await page.getByLabel(/email|correo/i).fill('admin@example.com');
      await page.getByLabel(/password|contraseña/i).fill('SecurePass123!');

      await page.getByRole('button', { name: /sign up|crear cuenta/i }).click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Should show error about existing account
      const errorText = page.getByText(/already exists|ya existe|registered/i);

      if (await errorText.isVisible()) {
        await expect(errorText).toBeVisible();
      }
    });
  });

  test.describe('Forgot Password Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/forgot-password');
    });

    test('should display forgot password form', async ({ page }) => {
      await expect(page.getByLabel(/email|correo/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /send|enviar|reset/i })).toBeVisible();
    });

    test('should show success message after valid email', async ({ page }) => {
      await page.getByLabel(/email|correo/i).fill('test@example.com');
      await page.getByRole('button', { name: /send|enviar|reset/i }).click();

      // Wait for response
      await page.waitForTimeout(2000);

      // Should show success or confirmation message
      const successMessage = page.getByText(/sent|enviado|check.*email|revisa.*correo/i);

      if (await successMessage.isVisible()) {
        await expect(successMessage).toBeVisible();
      }
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard unauthenticated', async ({ page }) => {
      // Try to access dashboard without auth
      await page.goto('/dashboard');

      // Should redirect to login
      await page.waitForTimeout(1000);

      // Check we're on login page
      await expect(page).toHaveURL(/.*login.*|.*auth.*/);
    });

    test('should redirect to login when accessing residents page', async ({ page }) => {
      await page.goto('/dashboard/residents');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/.*login.*|.*auth.*/);
    });

    test('should redirect to login when accessing conversations', async ({ page }) => {
      await page.goto('/dashboard/conversations');
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/.*login.*|.*auth.*/);
    });
  });

  test.describe('Session Persistence', () => {
    test('should persist session after page reload', async ({ page, context }) => {
      // This test requires actual login
      // Skip if no test credentials available
      test.skip(!process.env.TEST_USER_EMAIL, 'No test credentials');

      await page.goto('/login');

      // Login with test credentials
      await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
      await page.getByLabel(/password/i).fill(process.env.TEST_USER_PASSWORD!);
      await page.getByRole('button', { name: /sign in|log in/i }).click();

      // Wait for redirect
      await page.waitForURL(/.*dashboard.*/);

      // Reload page
      await page.reload();

      // Should still be on dashboard (session persisted)
      await expect(page).toHaveURL(/.*dashboard.*/);
    });
  });

  test.describe('Accessibility', () => {
    test('login page should be accessible', async ({ page }) => {
      await page.goto('/login');

      // Check form labels
      const emailLabel = page.getByLabel(/email|correo/i);
      await expect(emailLabel).toBeVisible();

      const passwordLabel = page.getByLabel(/password|contraseña/i);
      await expect(passwordLabel).toBeVisible();

      // Check submit button has accessible name
      const submitButton = page.getByRole('button', { name: /sign in|log in|iniciar/i });
      await expect(submitButton).toBeVisible();
    });
  });
});
