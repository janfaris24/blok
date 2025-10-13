// Stripe Price IDs - These are safe to use on client side
export const STRIPE_PRICES = {
  STARTER: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
  PROFESSIONAL: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID || process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
  ENTERPRISE: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
} as const;

// Plan details
export const PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceId: STRIPE_PRICES.STARTER,
    maxUnits: 25,
    features: [
      'WhatsApp messaging',
      'AI-powered responses',
      'Basic maintenance tracking',
      'Resident management',
      'Email support',
    ],
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 79,
    priceId: STRIPE_PRICES.PROFESSIONAL,
    maxUnits: 75,
    features: [
      'Everything in Starter',
      'Broadcast messages',
      'Service provider management',
      'Advanced analytics',
      'Knowledge base',
      'Priority support',
    ],
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 149,
    priceId: STRIPE_PRICES.ENTERPRISE,
    maxUnits: 200,
    features: [
      'Everything in Professional',
      'Unlimited units',
      'Custom integrations',
      'Dedicated account manager',
      'White-label options',
      '24/7 priority support',
    ],
  },
} as const;

export type PlanType = keyof typeof PLANS;
