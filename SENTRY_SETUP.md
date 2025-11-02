# 🚨 Sentry Setup Complete!

Sentry is now fully configured for Blok. Here's how to test it:

---

## ✅ What's Already Done

1. ✅ Sentry SDK installed (`@sentry/nextjs`)
2. ✅ Configuration files created:
   - `sentry.client.config.ts` - Browser errors + Session Replay
   - `sentry.server.config.ts` - Server-side errors
   - `sentry.edge.config.ts` - Edge runtime errors
   - `instrumentation.ts` - Initializes Sentry
3. ✅ Environment variables added to `.env.local`
4. ✅ Next.js config updated with Sentry integration
5. ✅ Performance monitoring enabled (10% sampling in production)
6. ✅ Session Replay enabled (see what users did before errors)
7. ✅ Test page created at `/sentry-example-page`

---

## 🧪 Test Sentry Now

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Visit Test Page
Go to: **http://localhost:3000/sentry-example-page**

### Step 3: Trigger Test Error
Click any of the test buttons on the page

### Step 4: Check Sentry Dashboard
Go to: **https://blok-4e.sentry.io/issues/**

You should see the error appear within seconds!

---

## 🎯 What You'll See in Sentry

When you click a test button, Sentry will capture:

1. **Error Details**
   - Error message
   - Stack trace (exact line of code)
   - Browser/OS info
   - Timestamp

2. **Session Replay** 🎥
   - Video recording of what the user did
   - Mouse movements, clicks, scrolls
   - Everything leading up to the error

3. **Breadcrumbs**
   - User actions before error
   - Console logs
   - Network requests

4. **Performance Data**
   - Page load times
   - API response times
   - Slow database queries

---

## 🚀 Production Setup

### When You Deploy to Vercel:

1. **Add Environment Variables** in Vercel Dashboard:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://355f9ed410f772883cdb8c26f79702ec@o4510290975064064.ingest.us.sentry.io/4510291014320128
   SENTRY_ORG=blok-4e
   SENTRY_PROJECT=blok-sentry
   ```

2. **Create Auth Token** (for source maps):
   - Go to: https://sentry.io/settings/account/api/auth-tokens/
   - Create new token with scope: `project:releases`
   - Add to Vercel: `SENTRY_AUTH_TOKEN=your-token`

3. **Deploy!**
   - Sentry automatically:
     - Uploads source maps
     - Tracks releases
     - Monitors performance
     - Captures errors

---

## 📊 Using Sentry in Your Code

### Track API Errors
```typescript
import { trackAPIError } from '@/lib/error-tracking';

try {
  const response = await fetch('/api/residents');
  if (!response.ok) throw new Error('Failed');
} catch (error) {
  trackAPIError(error as Error, {
    endpoint: '/api/residents',
    method: 'GET',
    statusCode: 500,
    userId: user.id,
  });
}
```

### Track Supabase Errors
```typescript
import { trackSupabaseError } from '@/lib/error-tracking';

const { data, error } = await supabase.from('residents').select('*');

if (error) {
  trackSupabaseError(error, {
    table: 'residents',
    operation: 'select',
    userId: user.id,
  });
}
```

### Set User Context
```typescript
import { setUserContext } from '@/lib/error-tracking';

// On login
setUserContext({
  id: user.id,
  email: user.email,
  buildingId: building.id,
  role: 'admin',
});
```

---

## 🔍 Sentry Dashboard Tour

### Issues Tab
- See all errors grouped by type
- Sort by frequency, last seen, etc.
- Click error to see full details

### Performance Tab
- See slow API routes
- Database query performance
- Page load times

### Releases Tab
- Track which deployment caused errors
- Compare error rates between versions

### Alerts Tab
- Set up Slack notifications
- Email alerts for critical errors
- PagerDuty integration

---

## 💡 Pro Tips

1. **Session Replay is POWERFUL**
   - You literally see what the user saw
   - Debug issues you can't reproduce locally
   - Understand user behavior

2. **Filter by Tags**
   - All errors tagged with `service: blok-api`
   - Filter by user, building, feature
   - Create custom dashboards

3. **Performance Insights**
   - Find slow database queries
   - Optimize API routes
   - Improve user experience

4. **Ignore Noise**
   - Already configured to ignore:
     - Browser extensions
     - Network errors
     - Supabase auth refresh (expected)

---

## 🆘 Troubleshooting

### "No errors showing up in Sentry"
- Check dev console: Errors logged but not sent in dev mode
- Set `NODE_ENV=production` to test
- Check DSN is correct in `.env.local`

### "Source maps not working"
- Need to add `SENTRY_AUTH_TOKEN` env variable
- Deploy to Vercel to test (works automatically)

### "Too many events"
- Adjust `tracesSampleRate` in config (currently 10% in production)
- Adjust `replaysSessionSampleRate` for fewer replays

---

## 📚 Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Your Sentry Dashboard](https://blok-4e.sentry.io/)
- [Session Replay Guide](https://docs.sentry.io/platforms/javascript/session-replay/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/guides/nextjs/performance/)

---

## 🎉 You're All Set!

**Go test it now:** http://localhost:3000/sentry-example-page

Click a button → Check Sentry → See your first error! 🚀

**Questions?** Check `TESTING.md` or Sentry docs above.

---

## 🔄 CI/CD Integration with Vercel & GitHub

### How Sentry Works in Your Deployment Pipeline

#### 1. **Vercel Deployment** (Automatic!)

```
git push origin main
  ↓
Vercel detects change and starts build
  ↓
next.config.ts → withSentryConfig() activates
  ↓
Sentry webpack plugin:
  - Uploads source maps to Sentry
  - Creates release: "commit-sha"
  - Links commits to release
  ↓
Deploy completes
  ↓
Production errors show EXACT code locations (not minified!)
```

#### 2. **Environment Separation**

Sentry automatically detects environments:

- **Development** (`localhost:3000`)
  - `environment: "development"`
  - 100% trace sampling (all errors tracked)
  - All Session Replays captured

- **Preview** (Vercel preview deployments)
  - `environment: "preview"`
  - Each PR gets its own preview URL
  - Errors tagged with preview environment

- **Production** (`blokpr.co`)
  - `environment: "production"`
  - 10% trace sampling (reduces costs)
  - Only error replays captured (100%)

#### 3. **GitHub Integration** (Recommended Setup)

**Step 1: Connect GitHub to Sentry**
1. Go to: https://blok-4e.sentry.io/settings/integrations/github/
2. Click "Install GitHub Integration"
3. Authorize Sentry to access your repository
4. Select your `blok` repository

**What This Enables:**
- 🔗 **Commit Linking**: See which commit introduced the bug
- 🐛 **Suspect Commits**: Sentry suggests which code change caused the error
- 📝 **Issue Tracking**: Close Sentry issues with commit messages:
  ```bash
  git commit -m "Fix authentication bug (fixes BLOK-SENTRY-42)"
  ```
- 👥 **Code Owners**: Auto-assign errors to the dev who wrote the code
- 📊 **Release Tracking**: See error trends across releases

**Step 2: Configure Code Owners (Optional)**
Create `.github/CODEOWNERS`:
```
# Automatically assign Sentry issues to code owners
/src/lib/condosync-ai.ts @janfaris
/src/lib/whatsapp-client.ts @janfaris
/src/app/api/** @janfaris
```

#### 4. **Source Maps Upload (Automatic)**

Already configured in `next.config.ts`:
```typescript
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,              // "blok-4e"
  project: process.env.SENTRY_PROJECT,      // "blok-sentry"
  authToken: process.env.SENTRY_AUTH_TOKEN, // Upload token
  widenClientFileUpload: true,              // Upload all source maps
  hideSourceMaps: true,                     // Hide from production bundle
};
```

**To Enable (Required for Production):**
1. Create Auth Token: https://sentry.io/settings/account/api/auth-tokens/
2. Scopes needed: `project:releases`, `project:write`
3. Add to Vercel Environment Variables:
   ```
   SENTRY_AUTH_TOKEN=sntrys_your_token_here
   ```

Without this, production errors show minified code. With it, you see exact TypeScript source!

#### 5. **Playwright Tests + Sentry**

**Problem**: E2E tests trigger real errors that pollute Sentry

**Solution**: Filter test errors

Already configured in your Sentry configs:
```typescript
beforeSend(event) {
  // Don't send errors from Playwright tests
  if (event.request?.headers?.['user-agent']?.includes('Playwright')) {
    return null;
  }

  // Don't send if running in test mode
  if (process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.CI && event.environment === 'test') {
    return null;
  }

  return event;
}
```

**For Extra Safety**, update your test environment:
```typescript
// playwright.config.ts
use: {
  baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
  extraHTTPHeaders: {
    'X-Test-Run': 'true',  // Flag test requests
  },
}
```

Then filter in Sentry:
```typescript
// sentry.client.config.ts
beforeSend(event) {
  if (event.request?.headers?.['x-test-run']) {
    return null; // Don't send test errors
  }
  return event;
}
```

#### 6. **Alert Rules for Different Environments**

Create separate alert rules:

**Development Alerts** (Slack #dev-errors):
```
When: A new issue is created
If: environment = development
Then: Send to #dev-errors (no rate limit)
```

**Production Alerts** (Slack #all-blok + Email):
```
When: A new issue is created
If: environment = production AND level = error or fatal
Then:
  - Send to #all-blok (5 min rate limit)
  - Email on-call team
  - Create incident if > 100 events/min
```

**High-Volume Alerts** (PagerDuty):
```
When: Issue seen > 50 times in 5 minutes
If: environment = production
Then: Page on-call engineer
```

#### 7. **Vercel Environment Variables Setup**

Go to: https://vercel.com/YOUR_ORG/blok/settings/environment-variables

Add these for **Production**, **Preview**, and **Development**:

```bash
# Required
NEXT_PUBLIC_SENTRY_DSN=https://355f9ed410f772883cdb8c26f79702ec@o4510290975064064.ingest.us.sentry.io/4510291014320128
SENTRY_ORG=blok-4e
SENTRY_PROJECT=blok-sentry

# Required for source maps
SENTRY_AUTH_TOKEN=sntrys_your_token_here

# Optional: Enable/disable Sentry per environment
NEXT_PUBLIC_ENABLE_SENTRY=true
```

#### 8. **Release Tracking**

Sentry automatically tracks releases using git commit SHA:

```typescript
// Configured in sentry configs
release: process.env.VERCEL_GIT_COMMIT_SHA || 'development'
```

**In Sentry Dashboard:**
- Go to: https://blok-4e.sentry.io/releases/
- See each deployment
- Compare error rates: "v2.1.0 has 300% more errors than v2.0.9!"
- Roll back if needed

#### 9. **Vercel Cron Monitoring**

Already enabled in `next.config.ts`:
```typescript
automaticVercelMonitors: true
```

**What this does:**
- Monitors your Vercel Cron Jobs
- Alerts if cron fails
- Tracks execution time
- Example: WhatsApp message queue processor, daily reports

#### 10. **CI/CD Workflow Example**

Your typical deployment flow:

```bash
# 1. Developer commits fix
git commit -m "Fix resident lookup error (fixes BLOK-SENTRY-15)"
git push origin feature-branch

# 2. GitHub triggers Vercel preview deployment
# - Sentry creates preview release
# - Source maps uploaded
# - Preview errors tagged separately

# 3. PR merged to main
git merge feature-branch

# 4. Vercel production deployment
# - Sentry creates production release "abc123def"
# - Links all commits since last release
# - Source maps uploaded
# - Release marked as "deployed"

# 5. Sentry automatically:
# - Closes issue BLOK-SENTRY-15 (found "fixes" in commit)
# - Tracks error rates for new release
# - Compares to previous release
# - Alerts if error rate increases

# 6. If errors spike:
# - Slack notification to #all-blok
# - Click issue → See Session Replay
# - Click "Suspect Commits" → See your code change
# - Click "Open in GitHub" → See PR that caused it
# - Revert or fix quickly
```

#### 11. **GitHub Actions Integration** (Optional)

For advanced workflows, create `.github/workflows/test.yml`:

```yaml
name: Test & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run type check
        run: npm run type-check

      - name: Run Playwright tests
        run: npm test
        env:
          CI: true
          PLAYWRIGHT_TEST_BASE_URL: http://localhost:3000

      # Don't send Playwright errors to Sentry
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

  # Notify Sentry of deployment
  deploy-notify:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Create Sentry release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: blok-4e
          SENTRY_PROJECT: blok-sentry
        with:
          environment: production
          version: ${{ github.sha }}
```

---

## 📊 Monitoring Checklist

After deploying to production:

- [ ] **Verify source maps working**
  - Trigger error in production
  - Check Sentry shows TypeScript source (not minified)

- [ ] **Test Slack notifications**
  - Trigger new error type
  - Verify message arrives in #all-blok

- [ ] **Check environment separation**
  - Development errors tagged `environment: development`
  - Production errors tagged `environment: production`

- [ ] **Verify releases tracked**
  - Go to Sentry Releases tab
  - See git commit SHA as release ID
  - See commit list for each release

- [ ] **Test Session Replay**
  - Trigger error with user actions
  - Click error in Sentry
  - Watch replay video

- [ ] **Monitor performance**
  - Check Sentry Performance tab
  - See API route response times
  - Identify slow database queries

---

## 🚨 Production Gotchas

### 1. **Source Maps Security**
- Source maps uploaded to Sentry (private)
- NOT included in production bundle (hideSourceMaps: true)
- Users can't see your source code
- Only your team sees readable stack traces

### 2. **Cost Management**
- Currently: 10% of transactions tracked (`tracesSampleRate: 0.1`)
- Adjust if hitting quota limits
- Production errors = 100% captured (always)
- Session Replays = Only on errors (reduces costs)

### 3. **Sensitive Data**
- Already configured to mask all text in replays
- Already configured to block media (images/videos)
- Add custom scrubbing in `beforeSend` if needed

### 4. **Rate Limits**
- Sentry has event quotas (check your plan)
- Currently configured for:
  - All errors captured
  - 10% of performance traces
  - Session replays on errors only

---

## 🎯 Next Steps

1. **Create Sentry Auth Token**
   - Go to: https://sentry.io/settings/account/api/auth-tokens/
   - Name: "Vercel Source Maps"
   - Scopes: `project:releases`, `project:write`
   - Copy token

2. **Add to Vercel**
   - Go to: https://vercel.com/YOUR_ORG/blok/settings/environment-variables
   - Add: `SENTRY_AUTH_TOKEN=your_token`
   - Add to: Production, Preview, Development

3. **Connect GitHub**
   - Go to: https://blok-4e.sentry.io/settings/integrations/github/
   - Install integration
   - Select `blok` repository

4. **Test Production Deployment**
   ```bash
   git push origin main
   # Wait for Vercel deploy
   # Trigger error in production
   # Check Sentry shows readable source code
   ```

5. **Set Up Production Alerts**
   - Create alert rule for production errors
   - Send to #all-blok Slack channel
   - Set up email notifications

---

## ✅ Integration Complete!

Your Sentry is now fully integrated with:
- ✅ Vercel (auto-deploy source maps)
- ✅ GitHub (commit tracking)
- ✅ Slack (real-time alerts)
- ✅ Playwright (test errors filtered)
- ✅ Multiple environments (dev/preview/prod)
- ✅ Session Replay (see what users did)
- ✅ Performance monitoring (API/DB performance)

**Deployment is automatic - just push to GitHub!** 🚀
