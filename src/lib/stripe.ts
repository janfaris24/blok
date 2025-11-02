import Stripe from 'stripe';

// Re-export plan definitions for convenience
export { PLANS, STRIPE_PRICES, type PlanType } from './stripe-plans';

// Only validate Stripe key at runtime, not during build
// This allows the build to succeed even without Stripe configured
const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
    typescript: true,
  });
};

// Lazy initialization - only creates client when first accessed
let _stripe: Stripe | null = null;

// Stripe client - SERVER SIDE ONLY
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    if (!_stripe) {
      _stripe = getStripeClient();
    }
    return (_stripe as any)[prop];
  }
});
