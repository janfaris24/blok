# Stripe Payment Integration Setup Guide

## 🎯 Overview

Blok now has a complete Stripe subscription payment integration with three pricing tiers:
- **Starter**: $29/month (1-25 units)
- **Professional**: $79/month (26-75 units)
- **Enterprise**: $149/month (76-200 units)

## 📋 Prerequisites

- Stripe account (sign up at https://stripe.com)
- Admin access to your Stripe Dashboard
- Vercel deployment or localhost with ngrok for webhook testing

## 🚀 Setup Steps

### 1. Create Stripe Account & Get API Keys

1. Go to https://dashboard.stripe.com/register
2. Complete account setup
3. Navigate to **Developers** → **API keys**
4. Copy your **Secret key** and **Publishable key**

### 2. Create Products and Pricing

#### Create Products

1. Go to **Products** → **Add Product**
2. Create three products:

**Product 1: Starter Plan**
- Name: `Blok Starter`
- Description: `Perfect for small condo buildings (1-25 units)`
- Pricing:
  - Model: `Recurring`
  - Price: `$29`
  - Billing period: `Monthly`
  - Copy the **Price ID** (starts with `price_`)

**Product 2: Professional Plan**
- Name: `Blok Professional`
- Description: `Advanced features for growing buildings (26-75 units)`
- Pricing:
  - Model: `Recurring`
  - Price: `$79`
  - Billing period: `Monthly`
  - Copy the **Price ID**

**Product 3: Enterprise Plan**
- Name: `Blok Enterprise`
- Description: `Complete solution for large buildings (76-200 units)`
- Pricing:
  - Model: `Recurring`
  - Price: `$149`
  - Billing period: `Monthly`
  - Copy the **Price ID**

### 3. Configure Environment Variables

Add to `.env.local`:

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Price IDs (from products you created)
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PROFESSIONAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Webhook Secret (will get in next step)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
# For local: http://localhost:3000
```

### 4. Set Up Webhooks

#### For Production (Vercel):

1. Go to **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://your-domain.com/api/stripe/webhooks`
3. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy the **Signing secret** (starts with `whsec_`) → Add to `STRIPE_WEBHOOK_SECRET`

#### For Local Development:

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   # or
   curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to localhost:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

4. Copy the webhook signing secret from the output
5. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 5. Configure Customer Portal

1. Go to **Settings** → **Billing** → **Customer portal**
2. Click **Activate test link** (for test mode)
3. Configure portal settings:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to update billing information
   - ✅ Allow customers to view invoices
   - ✅ Allow customers to cancel subscriptions
   - ✅ Show proration preview
4. Click **Save**

### 6. Test Mode vs Live Mode

#### Test Mode (for development):
- Use test API keys (start with `sk_test_` and `pk_test_`)
- Use test card: `4242 4242 4242 4242`
  - Any future expiry date
  - Any 3-digit CVC
  - Any ZIP code

#### Live Mode (for production):
1. Complete Stripe account verification
2. Switch to **Live mode** in Stripe Dashboard
3. Get live API keys (start with `sk_live_` and `pk_live_`)
4. Create products and prices in live mode
5. Update environment variables with live keys
6. Set up live webhook endpoint

### 7. Database Migration

The subscription fields are already added via migration:

```sql
-- Already applied in the codebase
ALTER TABLE buildings
  ADD COLUMN stripe_customer_id TEXT,
  ADD COLUMN stripe_subscription_id TEXT,
  ADD COLUMN stripe_price_id TEXT,
  ADD COLUMN current_period_start TIMESTAMPTZ,
  ADD COLUMN current_period_end TIMESTAMPTZ,
  ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;

CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🧪 Testing the Flow

### 1. Subscribe to a Plan

1. Login to dashboard
2. Go to **Settings** → **Billing** tab
3. Click **Select Plan** on any tier
4. You'll be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Complete checkout
7. Verify you're redirected back to dashboard
8. Check subscription status is **Active**

### 2. Manage Subscription

1. Go to **Settings** → **Billing** tab
2. Click **Manage Subscription**
3. You'll be redirected to Stripe Customer Portal
4. Test:
   - Update payment method
   - Change plan
   - Cancel subscription
   - View invoices

### 3. Verify Webhooks

1. Check Stripe Dashboard → **Developers** → **Webhooks**
2. View webhook events
3. Ensure all events show **Succeeded** status
4. Check database: `subscription_events` table should have logged events
5. Check `buildings` table: subscription fields should be updated

### 4. Test Failed Payment

1. Use test card `4000 0000 0000 0341` (declined)
2. Attempt to subscribe
3. Verify proper error handling
4. Check webhook events for `invoice.payment_failed`

### 5. Test Subscription Cancellation

1. In Customer Portal, cancel subscription
2. Verify `cancel_at_period_end` is set to `true`
3. Verify subscription still works until period end
4. Check `subscription_status` updates correctly

## 📊 Monitoring & Analytics

### Stripe Dashboard

Monitor in real-time:
- **Home**: Revenue, new customers, failed payments
- **Payments**: All transactions
- **Subscriptions**: Active, churned, scheduled
- **Customers**: Customer list and details

### Database Queries

Check subscription status:
```sql
SELECT
  b.name,
  b.subscription_status,
  b.current_period_end,
  b.cancel_at_period_end,
  b.stripe_price_id
FROM buildings b
WHERE b.stripe_subscription_id IS NOT NULL;
```

View webhook events:
```sql
SELECT
  event_type,
  event_data,
  created_at
FROM subscription_events
ORDER BY created_at DESC
LIMIT 20;
```

## 🔐 Security Best Practices

1. **Never commit API keys** - Use environment variables
2. **Verify webhook signatures** - Already implemented in webhook handler
3. **Use HTTPS in production** - Required for Stripe
4. **Implement rate limiting** - Consider adding to API routes
5. **Log all events** - Already logging to `subscription_events` table

## 🚨 Troubleshooting

### Webhook Not Receiving Events

1. Check endpoint URL is correct and accessible
2. Verify webhook secret matches environment variable
3. Check Stripe CLI is running (for local dev)
4. View webhook logs in Stripe Dashboard

### Subscription Not Updating

1. Check webhook is processing successfully
2. Verify metadata includes `buildingId`
3. Check database for subscription_events entries
4. Ensure RLS policies allow updates

### Checkout Session Fails

1. Verify price IDs are correct
2. Check API keys are for correct mode (test/live)
3. Ensure customer has valid email
4. Check Stripe Dashboard for error logs

### Customer Portal Issues

1. Verify customer portal is activated in Stripe
2. Check customer ID exists in database
3. Ensure proper return URL is set
4. Test with different browsers (cache issues)

## 📝 Going to Production Checklist

- [ ] Complete Stripe account verification
- [ ] Switch to live mode API keys
- [ ] Create products/prices in live mode
- [ ] Update environment variables with live keys
- [ ] Set up live webhook endpoint
- [ ] Test complete flow with real card
- [ ] Monitor first few transactions closely
- [ ] Set up Stripe Radar (fraud prevention)
- [ ] Configure email receipts
- [ ] Set up billing alerts

## 💰 Pricing Strategy

### Current Tiers:

| Plan | Price | Units | Target Audience |
|------|-------|-------|-----------------|
| Starter | $29/mo | 1-25 | Small condos |
| Professional | $79/mo | 26-75 | Medium buildings |
| Enterprise | $149/mo | 76-200 | Large buildings |

### Revenue Projections:

- 100 Starter customers: $2,900/mo
- 50 Professional customers: $3,950/mo
- 20 Enterprise customers: $2,980/mo
- **Total: $9,830/mo recurring revenue**

### Stripe Fees:

- 2.9% + $0.30 per transaction
- Example: $79 plan = $2.59 fee = **$76.41 net**

## 🔗 Useful Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe Testing Cards](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Customer Portal Docs](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)

---

## 🎉 You're All Set!

Your Stripe integration is complete. Users can now:
- ✅ Subscribe to plans directly in the dashboard
- ✅ Manage subscriptions via Stripe Customer Portal
- ✅ Update payment methods securely
- ✅ View invoices and billing history
- ✅ Cancel or change plans anytime

All subscription events are automatically synced to your database via webhooks.
