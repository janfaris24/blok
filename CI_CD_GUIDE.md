# Simplified CI/CD with Vercel

## Overview

We've simplified the CI/CD pipeline by **removing all build/deploy logic from GitHub Actions** and letting **Vercel handle everything automatically**.

## How It Works

### ✅ What GitHub Actions Does (Quality Checks Only)

**Fast checks that run in parallel with Vercel:**

1. **Type Check** - Validates TypeScript types (fails the workflow if errors found)
2. **Smoke Tests** - Runs critical E2E tests (informational only, doesn't block deployment)

**Total time:** ~2-3 minutes (runs in parallel with Vercel build)

### 🚀 What Vercel Does Automatically

**Zero configuration needed:**

1. **On every push to any branch:**
   - Builds the project
   - Deploys to preview URL
   - Runs edge functions
   - Uploads source maps to Sentry
   - Shows build status in GitHub PR

2. **On push to `main` branch:**
   - Builds for production
   - Deploys to production (blokpr.co)
   - Automatic rollback if build fails
   - Zero downtime deployment

3. **On every PR:**
   - Creates isolated preview environment
   - Comments on PR with preview URL
   - Automatically updates preview on new commits

4. **Build caching:**
   - Intelligently caches dependencies
   - Only rebuilds what changed
   - 10x faster builds than GitHub Actions

## Benefits of This Approach

### Before (Complex GitHub Actions)
- ❌ 145 lines of YAML configuration
- ❌ 3 separate jobs (type-check, smoke-tests, build)
- ❌ Manual Sentry source map uploads
- ❌ Slower builds (no caching optimization)
- ❌ More moving parts to maintain

### After (Vercel + Minimal Actions)
- ✅ 105 lines (30% reduction)
- ✅ 2 simple jobs (just quality checks)
- ✅ Automatic Sentry integration
- ✅ Faster builds with intelligent caching
- ✅ Less to maintain and debug

## Configuration

### Vercel Environment Variables

Set these in Vercel dashboard for each environment:

**Production:** https://vercel.com/[your-team]/[project]/settings/environment-variables

```bash
# Required for all environments
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
ANTHROPIC_API_KEY=sk-ant-xxx

# Sentry (automatic source map upload)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=blok-4e
SENTRY_PROJECT=blok-sentry
SENTRY_AUTH_TOKEN=xxx

# Stripe (optional - only if using payment features)
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (Resend)
RESEND_API_KEY=re_xxx
SUPPORT_EMAIL=support@blokpr.co
```

**Tip:** Use Vercel's environment variable inheritance:
- Set shared vars in "All Environments"
- Override with production/preview-specific values

### GitHub Secrets

Only needed for smoke tests:

```bash
# Test credentials (optional - tests are informational only)
TEST_USER_EMAIL=admin@demo.com
TEST_USER_PASSWORD=xxx

# Supabase (for test database)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# API keys for test data
ANTHROPIC_API_KEY=sk-ant-xxx

# Sentry (optional - for test error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## Deployment Workflow

### Development
```bash
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
```
→ Vercel creates preview deployment automatically
→ GitHub Actions runs type-check + smoke tests
→ Preview URL appears in GitHub PR

### Production
```bash
git checkout main
git merge feature/new-feature
git push origin main
```
→ Vercel deploys to production automatically
→ GitHub Actions validates code quality
→ Live at blokpr.co in ~2 minutes

### Rollback (if needed)
Go to Vercel dashboard → Deployments → Click "Promote to Production" on previous deployment

Or use Vercel CLI:
```bash
vercel rollback
```

## Monitoring

### Vercel Dashboard
- **Real-time build logs:** https://vercel.com/[team]/[project]/deployments
- **Analytics:** Page views, performance metrics
- **Functions:** Edge function invocations and errors

### Sentry Dashboard
- **Error tracking:** https://sentry.io/organizations/blok-4e/issues/
- **Performance:** Transaction traces, slow queries
- **Source maps:** Automatically uploaded by Vercel

### GitHub Actions
- **Type check status:** Immediate feedback on TypeScript errors
- **Smoke test results:** See critical flow status (informational)
- **Test artifacts:** Download Playwright reports/screenshots

## Troubleshooting

### Build fails on Vercel but passes locally
1. Check environment variables in Vercel dashboard
2. Verify all required vars are set for the environment
3. Check Vercel build logs for specific error

### Smoke tests fail but deployment succeeds
This is expected! Smoke tests are informational only and don't block deployment.
- Check Playwright report artifact in GitHub Actions
- Review screenshots in test-results artifact
- Fix flaky tests in follow-up PR

### Type check fails
This **will block** the GitHub workflow (but not Vercel deployment).
- Fix TypeScript errors locally
- Run `npm run type-check` before pushing
- Commit the fixes

## Cost Comparison

### GitHub Actions Build (old approach)
- ~5 minutes per build
- 2000 free minutes/month
- ~400 builds/month before hitting limit

### Vercel Build (new approach)
- ~2 minutes per build (faster caching)
- Included in Pro plan
- Unlimited builds

**Savings:** ~60% faster builds + no GitHub Actions minute limits

## Best Practices

1. **Don't commit secrets** - Use Vercel dashboard for env vars
2. **Test locally first** - Run `npm run build` before pushing
3. **Use preview deployments** - Test features in isolation before merging
4. **Monitor Sentry** - Check for errors after production deploys
5. **Keep smoke tests fast** - Only test critical flows (12 tests max)

## Further Simplification

If you want to go even simpler, you can:

1. **Remove smoke tests from CI** - Run them manually or scheduled
2. **Only keep type-check** - Fastest possible CI validation
3. **Use Vercel CLI locally** - Test production builds before pushing

This gives you a 30-line GitHub Actions workflow that just validates TypeScript!
