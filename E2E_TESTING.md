# Blok E2E Testing - Production Quality Guide

**Production-grade end-to-end testing with DRY principles**

## 📋 Quick Start

```bash
# Run production smoke tests (FAST - 2-3 min)
npm run test:smoke

# Run all tests with UI
npm run test:ui

# Debug tests
npx playwright test --debug
```

---

## 🎯 Test Philosophy

### DRY (Don't Repeat Yourself)
- ✅ Reusable test helpers
- ✅ Centralized selectors
- ✅ Authentication fixtures
- ✅ Shared test utilities

### Production-First
- ✅ Fast smoke tests (~2-3 min)
- ✅ Reliable (no flaky tests)
- ✅ Critical user flows only
- ✅ Single browser (Chromium) in CI

---

## 📁 Test Structure

```
e2e/
├── smoke-tests.spec.ts           # ⭐ PRODUCTION SMOKE TESTS (run in CI)
├── auth-flow.spec.ts              # Comprehensive auth tests (optional)
├── waitlist.spec.ts               # Comprehensive waitlist tests (optional)
├── landing-page.spec.ts           # Comprehensive landing tests (optional)
├── fixtures/
│   └── auth.ts                    # Auth fixtures for reusable login
└── utils/
    ├── test-helpers.ts            # Reusable helper functions
    └── selectors.ts               # Centralized selectors & constants
```

---

## ⚡ Running Tests

### Local Commands

```bash
# Smoke tests only (recommended for quick validation)
npm run test:smoke

# All tests in UI mode (interactive)
npm run test:ui

# All tests headless
npm test

# Specific test file
npx playwright test e2e/smoke-tests.spec.ts

# With headed browser (see what's happening)
npm run test:headed

# Debug mode (step through)
npx playwright test --debug

# Chromium only
npm run test:chromium

# Simulate CI environment
CI=true npm run test:smoke
```

### CI/CD (GitHub Actions)

Runs automatically on every push to `main`:
1. **Type Check** (~30s)
2. **Smoke Tests** (~2-3min)
3. **Build Check** (~1-2min)

---

## ✍️ Writing Tests (DRY Way)

### ❌ BAD: Repetitive Code

```typescript
test('login test', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');
  const emailInput = page.getByLabel(/email|correo/i);
  await emailInput.waitFor({ state: 'visible', timeout: 5000 });
  await emailInput.fill('test@example.com');
  const passwordInput = page.getByLabel(/password|contraseña/i);
  await passwordInput.waitFor({ state: 'visible', timeout: 5000 });
  await passwordInput.fill('password123');
  const loginButton = page.getByRole('button', { name: /log in|iniciar/i });
  await loginButton.waitFor({ state: 'visible', timeout: 5000 });
  await loginButton.click();
  await page.waitForURL(/.*dashboard.*/, { timeout: 10000 });
});
```

### ✅ GOOD: Using Helpers

```typescript
import { test } from './fixtures/auth';
import { Selectors, Routes, TestData } from './utils/selectors';

test('login test', async ({ authHelpers }) => {
  await authHelpers.login(
    TestData.testUser.email,
    TestData.testUser.password
  );
  await authHelpers.waitForURL(Routes.dashboard);
});
```

---

## 🛠️ Available Test Helpers

### TestHelpers Class

```typescript
import { TestHelpers } from './utils/test-helpers';

const helpers = new TestHelpers(page);

// Navigation
await helpers.navigateAndWait('/login');
await helpers.waitForPageLoad();
await helpers.waitForURL(/dashboard/);

// Form interaction
await helpers.fillField(/email/i, 'user@example.com');
await helpers.clickButton(/submit/i);

// Waiting
await helpers.waitForText(/success/i);
await helpers.waitForModal();
await helpers.waitForNetworkIdle();

// Error handling
const error = await helpers.getErrorMessage();
const hasSuccess = await helpers.hasSuccessMessage();

// Utilities
await helpers.takeDebugScreenshot('debug-name');
await helpers.closeModal();
const exists = await helpers.elementExists('.selector');

// Generate unique test data
const email = TestHelpers.generateUniqueEmail('test');

// Retry flaky actions
await helpers.retryAction(async () => {
  await helpers.clickButton(/submit/i);
}, 3); // Retry up to 3 times
```

### AuthHelpers Class

```typescript
import { AuthHelpers } from './utils/test-helpers';

const auth = new AuthHelpers(page);

// Login
await auth.login('email@example.com', 'password');

// Logout
await auth.logout();

// Check authentication state
const isAuth = await auth.isAuthenticated();
```

### WaitlistHelpers Class

```typescript
import { WaitlistHelpers, TestHelpers } from './utils/test-helpers';

const waitlist = new WaitlistHelpers(page);

await waitlist.submitWaitlist({
  name: 'Test User',
  email: TestHelpers.generateUniqueEmail(),
  building: 'Test Building',
  phone: '787-555-0100',
});
```

---

## 🎯 Centralized Selectors

**Why?** Single source of truth for UI selectors. Change once, apply everywhere.

```typescript
import { Selectors, Routes, TestData } from './utils/selectors';

// Auth selectors
await page.getByLabel(Selectors.auth.emailInput);
await page.getByRole('button', { name: Selectors.auth.loginButton });

// Waitlist selectors
await page.getByLabel(Selectors.waitlist.nameInput);
await page.getByRole('button', { name: Selectors.waitlist.submitButton });

// Routes
await page.goto(Routes.login);
await testHelpers.waitForURL(Routes.dashboard);

// Test data
const email = TestData.testUser.email;
const timeout = TestData.timeouts.medium;
```

---

## 🔐 Authentication Fixtures

Reusable authenticated sessions to avoid repeated logins:

```typescript
import { test } from './fixtures/auth';
import { TestData } from './utils/selectors';

test('protected feature', async ({ authHelpers, page }) => {
  // Automatically logs in before test
  await authHelpers.login(
    TestData.testUser.email,
    TestData.testUser.password
  );

  // Your test code here
  await page.goto('/dashboard/settings');

  // Auto-logout happens after test
});
```

---

## 📊 Production Smoke Tests

### What They Cover

✅ **Landing page loads**
✅ **Waitlist form submission**
✅ **Login page renders**
✅ **Login flow works**
✅ **Dashboard loads when authenticated**
✅ **Protected routes redirect unauthenticated users**
✅ **Invalid credentials show errors**
✅ **Session persistence after reload**

### Why Only These?

**Fast**: 2-3 minutes total
**Critical**: Core business value
**Reliable**: No flaky tests
**Production**: Must pass before deployment

### When to Add More

Add to smoke tests if:
- ✅ Failure would block production
- ✅ Test is fast and reliable
- ✅ Validates core business flow

Keep in comprehensive tests if:
- ❌ Test covers edge cases
- ❌ Test requires multiple browsers
- ❌ Test is slow or potentially flaky

---

## 🐛 Debugging Failed Tests

### Locally

```bash
# Step through test execution
npx playwright test --debug

# Run with browser visible
npm run test:headed

# Interactive UI mode
npm run test:ui

# Run specific test
npx playwright test -g "test name pattern"
```

### In CI (GitHub Actions)

1. Go to **Actions** tab
2. Click failed workflow
3. Download artifacts:
   - `smoke-test-report` - HTML report
   - `smoke-test-screenshots` - Failure screenshots
4. Open `index.html` in browser

### Common Issues

**Issue**: Test times out waiting for element
**Fix**: Verify selector in `utils/selectors.ts`, check element exists in UI

**Issue**: Login test fails
**Fix**: Check `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` env vars are set

**Issue**: Flaky test (passes sometimes)
**Fix**: Replace `page.waitForTimeout()` with proper waits like `waitForNetworkIdle()`

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow

File: `.github/workflows/test.yml`

**Triggers**:
- Every push to `main`
- Every pull request to `main`

**Jobs**:
1. Type Check → TypeScript validation
2. Smoke Tests → Critical user flows
3. Build Check → Production build works
4. Notify Success → Summary

**Required GitHub Secrets**:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_SENTRY_DSN
SENTRY_AUTH_TOKEN
TEST_USER_EMAIL
TEST_USER_PASSWORD
```

### Viewing Results

**Success**:
```
✅ Type Check (30s)
✅ Production Smoke Tests (2m 45s)
✅ Build Check (1m 22s)
```

**Failure**:
- Click workflow run in Actions tab
- View logs for failed step
- Download test report artifacts

---

## ✨ Best Practices

### 1. Always Use Helpers

```typescript
// ❌ Bad
await page.goto('/login');
await page.waitForLoadState('domcontentloaded');

// ✅ Good
await testHelpers.navigateAndWait('/login');
```

### 2. Centralize Selectors

```typescript
// ❌ Bad
await page.getByLabel(/email|correo/i);

// ✅ Good
await page.getByLabel(Selectors.auth.emailInput);
```

### 3. Use Proper Waits

```typescript
// ❌ Bad - Flaky!
await page.waitForTimeout(3000);

// ✅ Good - Reliable
await testHelpers.waitForNetworkIdle();
await testHelpers.waitForURL(/dashboard/);
```

### 4. Generate Unique Data

```typescript
// ❌ Bad - Will fail on duplicate
await submitWaitlist({ email: 'test@example.com' });

// ✅ Good - Always unique
await submitWaitlist({
  email: TestHelpers.generateUniqueEmail()
});
```

### 5. Clear Test Names

```typescript
// ❌ Bad
test('test 1', async ({ page }) => { ... });

// ✅ Good
test('Waitlist form submission works end-to-end', async ({ page }) => {
  ...
});
```

### 6. Take Screenshots for Verification

```typescript
test('critical flow', async ({ page }) => {
  // ... test steps

  // Verify with screenshot
  await page.screenshot({
    path: 'test-results/flow-success.png',
  });
});
```

---

## 📝 Adding New Tests

### Template

```typescript
import { test, expect } from './fixtures/auth';
import { TestHelpers } from './utils/test-helpers';
import { Selectors, Routes, TestData } from './utils/selectors';

test.describe('Feature Name', () => {

  test('specific behavior description', async ({ page, testHelpers }) => {
    // Arrange - Set up test state
    await testHelpers.navigateAndWait(Routes.home);

    // Act - Perform actions
    await testHelpers.clickButton(Selectors.common.submitButton);

    // Assert - Verify results
    const hasSuccess = await testHelpers.hasSuccessMessage();
    expect(hasSuccess).toBe(true);
  });

});
```

### Adding New Helpers

If you find repeated code, add to `e2e/utils/test-helpers.ts`:

```typescript
export class MyFeatureHelpers extends TestHelpers {
  async performComplexAction(data: MyData) {
    // Reusable logic
  }
}
```

### Adding New Selectors

Add to `e2e/utils/selectors.ts`:

```typescript
export const Selectors = {
  // ...existing selectors
  myFeature: {
    input: /my input label/i,
    button: /my button/i,
  },
} as const;
```

---

## 🔍 Quick Reference

### Essential Commands

```bash
npm run test:smoke       # Smoke tests (fast)
npm test                 # All tests
npm run test:ui          # Interactive UI
npm run test:headed      # Show browser
npx playwright test --debug  # Debug mode
```

### File Locations

```bash
e2e/smoke-tests.spec.ts      # Production smoke tests
e2e/fixtures/auth.ts         # Auth fixtures
e2e/utils/test-helpers.ts    # Helper functions
e2e/utils/selectors.ts       # Selectors & constants
.github/workflows/test.yml   # CI/CD workflow
```

### Environment Setup

```bash
# Required for tests
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
TEST_USER_EMAIL=admin@demo.com
TEST_USER_PASSWORD=demo123
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

---

## 📚 Examples

### Example 1: Simple Navigation Test

```typescript
test('homepage loads', async ({ testHelpers }) => {
  await testHelpers.navigateAndWait(Routes.home);
  await testHelpers.waitForText(/Blok/i);
});
```

### Example 2: Form Submission Test

```typescript
test('waitlist submission', async ({ page }) => {
  const waitlist = new WaitlistHelpers(page);

  await waitlist.navigateAndWait(Routes.home);
  await waitlist.submitWaitlist({
    name: 'Test User',
    email: TestHelpers.generateUniqueEmail(),
  });

  const hasSuccess = await waitlist.hasSuccessMessage();
  expect(hasSuccess).toBe(true);
});
```

### Example 3: Authenticated Flow Test

```typescript
test('dashboard access', async ({ authHelpers, page }) => {
  await authHelpers.login(
    TestData.testUser.email,
    TestData.testUser.password
  );

  const mainContent = page.locator(Selectors.dashboard.mainContent);
  await expect(mainContent).toBeVisible();
});
```

---

**Questions?** Check test files for more examples or ask the team!
