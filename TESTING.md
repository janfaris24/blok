# 🧪 Testing & Monitoring Guide - Blok

Complete guide for running tests and monitoring production errors in Blok.

---

## 📋 Table of Contents

- [End-to-End (E2E) Testing with Playwright](#e2e-testing-with-playwright)
- [Production Error Tracking with Sentry](#production-error-tracking-with-sentry)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)

---

## 🎭 E2E Testing with Playwright

### Why Playwright?

- ✅ **Multi-browser support**: Chrome, Firefox, Safari (WebKit)
- ✅ **Mobile testing**: Test on iPhone & Android viewports
- ✅ **Built-in accessibility testing**: Using axe-core
- ✅ **Visual regression**: Screenshot comparison
- ✅ **Network mocking**: Test offline scenarios
- ✅ **Video & trace recording**: Debug failed tests easily

### Installation

Already installed! Dependencies:
```bash
npm install --save-dev @playwright/test @axe-core/playwright
npx playwright install chromium webkit firefox
```

### Running Tests

```bash
# Run all tests (headless)
npm test

# Run with UI mode (best for development)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Run in debug mode (step through tests)
npm run test:debug

# Run specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Run mobile tests only
npm run test:mobile

# View last test report
npm run test:report
```

### Test Structure

```
e2e/
├── landing-page.spec.ts   # Homepage, navigation, footer, accessibility
├── waitlist.spec.ts       # Waitlist form, validation, submission
├── auth-flow.spec.ts      # Login, signup, password reset, sessions
└── (add more as needed)
```

### Writing New Tests

Example test file:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/your-page');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    const button = page.getByRole('button', { name: /Click Me/i });

    // Act
    await button.click();

    // Assert
    await expect(page.getByText('Success!')).toBeVisible();
  });
});
```

### Key Playwright Features

#### 1. **Locators** (Always prefer accessible selectors)
```typescript
// ✅ GOOD - Using accessible roles
page.getByRole('button', { name: /Submit/i })
page.getByRole('heading', { name: /Welcome/i })
page.getByLabel(/Email/i)
page.getByText(/Success message/i)

// ❌ BAD - Using CSS classes (fragile)
page.locator('.btn-primary')
page.locator('#my-element')
```

#### 2. **Assertions**
```typescript
await expect(element).toBeVisible()
await expect(element).toBeHidden()
await expect(element).toBeEnabled()
await expect(element).toBeDisabled()
await expect(element).toHaveText(/Expected text/i)
await expect(element).toHaveValue('value')
await expect(page).toHaveURL(/.*dashboard/)
await expect(page).toHaveTitle(/Page Title/)
```

#### 3. **Accessibility Testing**
```typescript
import AxeBuilder from '@axe-core/playwright';

test('should pass accessibility checks', async ({ page }) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});
```

#### 4. **Network Mocking**
```typescript
test('should handle offline gracefully', async ({ page }) => {
  // Simulate offline
  await page.context().setOffline(true);

  // Test behavior...

  // Restore online
  await page.context().setOffline(false);
});
```

#### 5. **Screenshots & Videos**
Automatically captured on failure! Find them in `test-results/`.

### Test Coverage Areas

✅ **Landing Page** (`e2e/landing-page.spec.ts`)
- Hero section loads
- Navigation works
- Language switcher (ES/EN)
- Footer links (Privacy, Terms)
- Dark mode toggle
- Accessibility compliance
- Mobile responsiveness
- Video backgrounds load

✅ **Waitlist** (`e2e/waitlist.spec.ts`)
- Form validation
- Email format validation
- Duplicate prevention
- Success messages
- Error handling
- Loading states
- Accessibility

✅ **Auth Flows** (`e2e/auth-flow.spec.ts`)
- Login validation
- Signup validation
- Password strength
- Forgot password
- Protected routes redirect
- Session persistence
- Accessibility

### Environment Variables for Testing

```bash
# .env.local
TEST_USER_EMAIL=admin@example.com
TEST_USER_PASSWORD=test-password-123
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

---

## 🚨 Production Error Tracking with Sentry

### Why Sentry?

- ✅ **Real-time error tracking**: Know immediately when users hit errors
- ✅ **Session Replay**: See exactly what users did before error
- ✅ **Source maps**: Readable stack traces
- ✅ **Performance monitoring**: Track slow API routes
- ✅ **Release tracking**: Know which deployment caused issues
- ✅ **Breadcrumbs**: See user actions leading to error

### Setup

1. **Create Sentry Account**
   - Go to [sentry.io](https://sentry.io)
   - Create new Next.js project
   - Copy DSN

2. **Add Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
   SENTRY_ORG=your-org-name
   SENTRY_PROJECT=your-project-name
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

3. **Done!** Sentry is already integrated in the codebase.

### Tracking Custom Errors

#### API Errors
```typescript
import { trackAPIError } from '@/lib/error-tracking';

try {
  const response = await fetch('/api/residents');
  if (!response.ok) throw new Error('Failed to fetch');
} catch (error) {
  trackAPIError(error as Error, {
    endpoint: '/api/residents',
    method: 'GET',
    statusCode: 500,
    userId: user.id,
    buildingId: building.id,
  });
}
```

#### Supabase Errors
```typescript
import { trackSupabaseError } from '@/lib/error-tracking';

const { data, error } = await supabase
  .from('residents')
  .select('*');

if (error) {
  trackSupabaseError(error, {
    table: 'residents',
    operation: 'select',
    userId: user.id,
  });
}
```

#### WhatsApp/Twilio Errors
```typescript
import { trackWhatsAppError } from '@/lib/error-tracking';

try {
  await sendWhatsAppMessage(phone, message);
} catch (error) {
  trackWhatsAppError(error as Error, {
    phone: resident.phone,
    buildingId: building.id,
    messageType: 'conversation',
  });
}
```

#### AI (Anthropic) Errors
```typescript
import { trackAIError } from '@/lib/error-tracking';

try {
  const analysis = await analyzeMessage(text);
} catch (error) {
  trackAIError(error as Error, {
    model: 'claude-sonnet-4-5',
    prompt: text,
    buildingId: building.id,
  });
}
```

#### Stripe Payment Errors
```typescript
import { trackPaymentError } from '@/lib/error-tracking';

try {
  await stripe.paymentIntents.create({...});
} catch (error) {
  trackPaymentError(error as Error, {
    userId: user.id,
    amount: 9900,
    currency: 'usd',
  });
}
```

### Setting User Context

```typescript
import { setUserContext, clearUserContext } from '@/lib/error-tracking';

// On login
setUserContext({
  id: user.id,
  email: user.email,
  buildingId: building.id,
  role: 'admin',
});

// On logout
clearUserContext();
```

### Error Boundary (React Errors)

Already integrated! Add to any route:

```typescript
// app/error.tsx
import { ErrorBoundary } from '@/components/error-boundary';

export default ErrorBoundary;
```

### Viewing Errors in Sentry

1. Go to [sentry.io](https://sentry.io/organizations/YOUR_ORG/issues/)
2. See all errors in real-time
3. Click on error for:
   - Full stack trace
   - User context
   - Breadcrumbs (user actions)
   - Session replay (what they did)
   - Release info (which deployment)

### Sentry Alerts

Configure alerts in Sentry dashboard:
- Slack notifications on critical errors
- Email on new error types
- PagerDuty for emergencies

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Vercel Integration

Sentry automatically integrates with Vercel:
- Source maps uploaded on deploy
- Release tracking enabled
- Errors tagged with deployment URL

---

## ✅ Best Practices

### Testing

1. **Test user flows, not implementation**
   - ✅ "User can submit waitlist form"
   - ❌ "Button click triggers useState"

2. **Use accessible selectors**
   - ✅ `getByRole('button', { name: /Submit/i })`
   - ❌ `locator('.btn-primary')`

3. **Test in multiple browsers**
   ```bash
   npm run test:webkit  # Safari users!
   npm run test:mobile  # Puerto Rico = mobile-heavy
   ```

4. **Check accessibility**
   - Run `AxeBuilder` on all pages
   - Fix violations before shipping

5. **Don't test external services directly**
   - Mock Supabase, Twilio, Anthropic in tests
   - Only test your code's behavior

### Error Tracking

1. **Track errors with context**
   - Include user ID, building ID
   - Include operation being performed
   - Don't include sensitive data (passwords, tokens)

2. **Ignore expected errors**
   - Supabase auth refresh failures (normal)
   - Browser extension errors
   - See `sentry.client.config.ts` for full list

3. **Set user context on login**
   - Helps debug user-specific issues
   - Clear on logout

4. **Monitor performance**
   - Sentry tracks slow API routes
   - Check Performance tab weekly

---

## 🚀 Quick Start

### For Development
```bash
# Start dev server
npm run dev

# In another terminal, run tests in UI mode
npm run test:ui
```

### Before Production Deploy
```bash
# Run full test suite
npm test

# Check build works
npm run build

# Run type checking
npm run type-check
```

### After Production Deploy
1. Check Sentry for any new errors
2. Monitor performance in Sentry
3. Run quick smoke test on production URL:
   ```bash
   PLAYWRIGHT_TEST_BASE_URL=https://blokpr.co npm run test:chromium
   ```

---

## 📚 Resources

- [Playwright Docs](https://playwright.dev)
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Axe Accessibility](https://github.com/dequelabs/axe-core)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 🆘 Troubleshooting

### Tests failing locally?
1. Make sure dev server is running (`npm run dev`)
2. Check `.env.local` has all required variables
3. Clear Playwright cache: `npx playwright install --force`

### Sentry not capturing errors?
1. Check `NEXT_PUBLIC_SENTRY_DSN` is set
2. Check `NODE_ENV` is not `development` (Sentry disabled in dev)
3. Check network tab for requests to `sentry.io`

### Tests passing locally but failing in CI?
1. Check CI has environment variables set
2. Increase timeouts in `playwright.config.ts`
3. Check GitHub Actions logs for specific error

---

**Need help?** Check the [CLAUDE.md](./CLAUDE.md) or ask Jan!
