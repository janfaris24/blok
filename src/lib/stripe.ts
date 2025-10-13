import Stripe from 'stripe';

// Re-export plan definitions for convenience
export { PLANS, STRIPE_PRICES, type PlanType } from './stripe-plans';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

// Stripe client - SERVER SIDE ONLY
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});
