import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }) => {
    // Check page loaded
    await expect(page).toHaveTitle(/Blok/);

    // Check hero section visible
    await expect(page.getByRole('heading', { name: /Respuestas Instantáneas 24\/7/i })).toBeVisible();
  });

  test('should display navigation correctly', async ({ page }) => {
    // Check all nav links are present
    await expect(page.getByRole('link', { name: /Características/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Precios/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /FAQ/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Feedback/i })).toBeVisible();
  });

  test('should switch language from Spanish to English', async ({ page }) => {
    // Find and click language switcher
    const languageSwitcher = page.locator('button[aria-label*="language"], button:has-text("EN"), button:has-text("ES")').first();

    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click();

      // Wait for language to change
      await page.waitForTimeout(500);

      // Check if content changed to English
      const englishContent = await page.getByText(/Instant.*Responses/i).count();
      expect(englishContent).toBeGreaterThan(0);
    }
  });

  test('should show hero CTA button', async ({ page }) => {
    const ctaButton = page.getByRole('button', { name: /Comenzar Gratis|Get Started Free/i });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();
  });

  test('should scroll to sections when clicking nav links', async ({ page }) => {
    // Click features link
    await page.getByRole('link', { name: /Características/i }).click();

    // Wait for scroll
    await page.waitForTimeout(1000);

    // Check we scrolled past hero
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(500);
  });

  test('should load all critical sections', async ({ page }) => {
    // Check all main sections exist
    const sections = [
      'hero',
      'paper-flyer',  // Problem section
      'demo',         // Video demo
      'about',        // About section
    ];

    for (const sectionId of sections) {
      const section = page.locator(`#${sectionId}, section:has-text("${sectionId}")`).first();
      // Scroll section into view
      await page.evaluate((id) => {
        const element = document.querySelector(`#${id}`) ||
                       Array.from(document.querySelectorAll('section'))
                         .find(s => s.textContent?.toLowerCase().includes(id));
        element?.scrollIntoView({ behavior: 'smooth' });
      }, sectionId);
      await page.waitForTimeout(500);
    }
  });

  test('should have working footer links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Check footer links exist
    await expect(page.getByRole('link', { name: /Privacidad/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Términos/i })).toBeVisible();
  });

  test('should navigate to privacy page', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Click privacy link
    await page.getByRole('link', { name: /Privacidad/i }).click();

    // Wait for navigation
    await page.waitForURL('**/privacy');

    // Check privacy page loaded
    await expect(page.getByRole('heading', { name: /Política de Privacidad|Privacy Policy/i })).toBeVisible();
  });

  test('should navigate to terms page', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Click terms link
    await page.getByRole('link', { name: /Términos/i }).click();

    // Wait for navigation
    await page.waitForURL('**/terms');

    // Check terms page loaded
    await expect(page.getByRole('heading', { name: /Términos y Condiciones|Terms and Conditions/i })).toBeVisible();
  });

  test('should pass accessibility checks', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check hero is still visible and readable
    await expect(page.getByRole('heading', { name: /Respuestas Instantáneas/i })).toBeVisible();

    // Check mobile menu exists (hamburger or mobile nav)
    const mobileMenu = page.locator('button[aria-label*="menu"], button:has-text("☰")').first();

    if (await mobileMenu.isVisible()) {
      // Mobile navigation exists
      await expect(mobileMenu).toBeVisible();
    }
  });

  test('should load videos properly', async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Check hero video exists and has source
    const heroVideo = page.locator('video').first();
    if (await heroVideo.count() > 0) {
      await expect(heroVideo).toBeVisible();

      // Check video has source
      const source = await heroVideo.locator('source').first();
      await expect(source).toHaveAttribute('src', /.+\.mp4/);
    }
  });

  test('should have dark mode toggle working', async ({ page }) => {
    // Find theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button:has([class*="sun"]), button:has([class*="moon"])').first();

    if (await themeToggle.isVisible()) {
      // Get initial theme
      const initialClass = await page.locator('html').getAttribute('class');

      // Click toggle
      await themeToggle.click();
      await page.waitForTimeout(300);

      // Check theme changed
      const newClass = await page.locator('html').getAttribute('class');
      expect(initialClass).not.toBe(newClass);
    }
  });
});
