# GitHub Actions CI/CD Setup

This guide explains how to set up GitHub Actions to automatically run tests on every push.

## ✅ What's Already Done

1. ✅ GitHub Actions workflow created (`.github/workflows/test.yml`)
2. ✅ Playwright configured for CI mode
3. ✅ Sentry configured to filter test errors
4. ✅ Type checking script ready

---

## 🔧 Required: Add GitHub Secrets

GitHub Actions needs access to your environment variables to run tests and builds.

### Step 1: Go to GitHub Secrets

**URL:** `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

Or navigate manually:
1. Go to your GitHub repository
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

### Step 2: Add These Secrets

Add each secret one by one. Copy the values from your `.env.local` file:

#### Required Secrets:

| Secret Name | Value | Where to Find |
|-------------|-------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ywavxrgibgfcvnxygpbz.supabase.co` | `.env.local` line 8 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | `.env.local` line 9 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | `.env.local` line 10 |
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | `.env.local` line 13 |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://355f9ed410f772883cdb8c26f79702ec@...` | `.env.local` line 43 |
| `SENTRY_AUTH_TOKEN` | `sntryu_f035c6c6fa17f921280d7f2884b3fa92...` | `.env.local` line 46 |

#### Optional Secrets (for full E2E tests):

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `TWILIO_ACCOUNT_SID` | From `.env.local` | WhatsApp testing |
| `TWILIO_AUTH_TOKEN` | From `.env.local` | WhatsApp testing |
| `STRIPE_SECRET_KEY` | From `.env.local` | Payment testing |
| `OPENAI_API_KEY` | From `.env.local` | Content moderation |
| `RESEND_API_KEY` | From `.env.local` | Email testing |

### Step 3: How to Add a Secret

1. Click **"New repository secret"**
2. **Name:** Enter the secret name exactly (e.g., `ANTHROPIC_API_KEY`)
3. **Secret:** Paste the value from `.env.local`
4. Click **"Add secret"**
5. Repeat for each secret

---

## 🚀 How It Works

### When You Push Code:

```bash
git add .
git commit -m "Add new feature"
git push origin main
```

**GitHub Actions automatically:**

1. **Type Check** (Job 1)
   - Checks TypeScript for errors
   - Fails if types are wrong

2. **Playwright Tests** (Job 2)
   - Installs Chromium browser
   - Starts Next.js dev server
   - Runs all tests in `/e2e`
   - Retries flaky tests 2 times
   - Uploads videos/screenshots on failure

3. **Build Check** (Job 3)
   - Runs production build
   - Ensures deployment won't fail
   - Uploads source maps to Sentry

4. **Deploy** (Automatic via Vercel)
   - Only happens if all tests pass ✅
   - Vercel deploys to production

---

## 📊 Viewing Test Results

### In GitHub:

1. Go to your repository
2. Click **Actions** tab
3. Click on any workflow run
4. See results for each job

### If Tests Fail:

1. Red ❌ appears on your commit
2. Check **Actions** tab for details
3. Download test videos/screenshots:
   - Click failed workflow
   - Scroll to **Artifacts**
   - Download `playwright-report` or `playwright-videos`

---

## 🎯 Workflow Jobs Explained

### Job 1: Type Check
```yaml
runs: npm run type-check
duration: ~30 seconds
fails if: TypeScript errors found
```

**Example failure:**
```
src/app/api/webhooks/whatsapp/route.ts:42:15
  Type 'string | undefined' is not assignable to type 'string'
```

### Job 2: Playwright Tests
```yaml
runs: npm test
duration: ~2-5 minutes
fails if: Any test fails after 2 retries
browsers: Chromium only (faster in CI)
```

**Example failure:**
```
✘ [chromium] › auth-flow.spec.ts:15:5 › Login flow › should redirect to dashboard
  Error: Timeout 30000ms exceeded waiting for selector "#dashboard"
```

### Job 3: Build
```yaml
runs: npm run build
duration: ~1-2 minutes
fails if: Build errors or warnings
```

**Example failure:**
```
Error: Missing environment variable NEXT_PUBLIC_SUPABASE_URL
```

---

## 🔍 Test Configuration for CI

### Differences from Local:

| Setting | Local | CI (GitHub Actions) |
|---------|-------|---------------------|
| Retries | 0 | 2 |
| Parallel | Yes | No (sequential) |
| Browsers | Chrome, Firefox, Safari | Chromium only |
| Videos | On failure | On failure |
| Sentry errors | Sent | Filtered out |

### Why Sequential in CI?
- Avoids race conditions
- More stable on limited resources
- GitHub runners have shared CPU

---

## 🚨 Troubleshooting

### Problem: "Secret not found"

**Error in logs:**
```
Error: Input required and not supplied: ANTHROPIC_API_KEY
```

**Fix:**
1. Go to GitHub Secrets (link above)
2. Add the missing secret
3. Re-run the workflow

---

### Problem: Tests timeout in CI

**Error:**
```
Timeout 60000ms exceeded
```

**Common causes:**
1. Supabase connection slow
2. CI runner overloaded
3. Test waits for element that doesn't appear

**Fix:**
- Increase timeout in test file
- Add better error handling
- Check if element selector changed

---

### Problem: Build succeeds locally, fails in CI

**Possible causes:**
1. Missing environment variable in GitHub Secrets
2. Different Node version (CI uses 20.x)
3. TypeScript strict mode difference

**Fix:**
1. Check GitHub Secrets match `.env.local`
2. Run `npm run build` locally first
3. Check workflow logs for specific error

---

## 🎉 Success Indicators

### Green Check ✅ on Commit:
```
✓ Type Check (30s)
✓ Playwright Tests (3m 45s)
✓ Build Check (1m 22s)
```

### Ready to Deploy:
- All jobs passed
- Vercel automatically deploys
- Sentry tracks release
- Source maps uploaded

---

## 📝 Next Steps After Setup

1. **Add more tests** to `/e2e` folder
2. **Set up branch protection**:
   - Go to Settings → Branches
   - Add rule for `main` branch
   - Require status checks to pass
   - Blocks merging if tests fail
3. **Monitor test runs** in Actions tab
4. **Update tests** as features change

---

## 🔗 Useful Links

- **GitHub Secrets:** `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
- **Actions Runs:** `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
- **Playwright Docs:** https://playwright.dev/docs/ci
- **GitHub Actions Docs:** https://docs.github.com/en/actions

---

## ⚡ Quick Reference

### Run tests locally:
```bash
npm test                  # Run all tests
npm run test:ui          # Interactive mode
npm run test:headed      # See browser
npm run test:debug       # Step through
```

### Check what CI will run:
```bash
CI=true npm test         # CI mode locally
npm run type-check       # Type checking
npm run build            # Production build
```

### View workflow status:
```bash
gh run list              # List recent runs
gh run view              # View latest run
gh run watch             # Watch current run
```

---

**Your workflow is ready!** Just add the GitHub Secrets and push to trigger it. 🚀
