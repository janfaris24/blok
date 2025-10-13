import { PLANS, type PlanType } from './stripe-plans';

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'unpaid'
  | null;

export interface SubscriptionData {
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  subscription_status: SubscriptionStatus;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
}

export interface FeatureAccess {
  hasAccess: boolean;
  currentPlan: PlanType | null;
  requiredPlan?: PlanType;
  reason?: string;
}

/**
 * Get the plan type from a Stripe price ID
 */
export function getPlanFromPriceId(priceId: string | null): PlanType | null {
  if (!priceId) return null;

  const plan = Object.entries(PLANS).find(
    ([_, planData]) => planData.priceId === priceId
  );

  return plan ? (plan[0] as PlanType) : null;
}

/**
 * Check if subscription is active (includes trialing and past_due with grace period)
 */
export function isSubscriptionActive(
  status: SubscriptionStatus,
  currentPeriodEnd: string | null
): boolean {
  // Active and trialing are always good
  if (status === 'active' || status === 'trialing') {
    return true;
  }

  // Past due gets a 7-day grace period
  if (status === 'past_due' && currentPeriodEnd) {
    const periodEnd = new Date(currentPeriodEnd);
    const gracePeriodEnd = new Date(periodEnd.getTime() + 7 * 24 * 60 * 60 * 1000);
    return new Date() < gracePeriodEnd;
  }

  return false;
}

/**
 * Check if subscription allows read-only access
 * Canceled subscriptions can view data but not create/edit
 */
export function hasReadOnlyAccess(
  status: SubscriptionStatus,
  currentPeriodEnd: string | null
): boolean {
  // Active subscriptions have full access (not read-only)
  if (isSubscriptionActive(status, currentPeriodEnd)) {
    return false;
  }

  // Canceled subscriptions get permanent read-only access to their data
  if (status === 'canceled') {
    return true;
  }

  // Incomplete/unpaid get 30-day read-only grace period
  if ((status === 'incomplete' || status === 'unpaid') && currentPeriodEnd) {
    const periodEnd = new Date(currentPeriodEnd);
    const gracePeriodEnd = new Date(periodEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
    return new Date() < gracePeriodEnd;
  }

  return false;
}

/**
 * Check if user has access to a specific feature
 */
export function checkFeatureAccess(
  subscription: SubscriptionData,
  feature: 'broadcasts' | 'analytics' | 'service_providers' | 'knowledge_base' | 'basic'
): FeatureAccess {
  const currentPlan = getPlanFromPriceId(subscription.stripe_price_id);
  const isActive = isSubscriptionActive(
    subscription.subscription_status,
    subscription.current_period_end
  );

  // No subscription = no access
  if (!currentPlan || !isActive) {
    return {
      hasAccess: false,
      currentPlan: null,
      requiredPlan: 'STARTER',
      reason: 'No active subscription',
    };
  }

  // Feature mapping
  const featureRequirements: Record<typeof feature, PlanType> = {
    basic: 'STARTER',
    broadcasts: 'PROFESSIONAL',
    analytics: 'PROFESSIONAL',
    service_providers: 'PROFESSIONAL',
    knowledge_base: 'PROFESSIONAL',
  };

  const requiredPlan = featureRequirements[feature];
  const planHierarchy: PlanType[] = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'];

  const currentPlanIndex = planHierarchy.indexOf(currentPlan);
  const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

  const hasAccess = currentPlanIndex >= requiredPlanIndex;

  return {
    hasAccess,
    currentPlan,
    requiredPlan: hasAccess ? undefined : requiredPlan,
    reason: hasAccess ? undefined : `Requires ${PLANS[requiredPlan].name} plan or higher`,
  };
}

/**
 * Check if user can add more units based on their plan
 */
export function checkUnitLimit(
  subscription: SubscriptionData,
  currentUnitCount: number
): FeatureAccess {
  const currentPlan = getPlanFromPriceId(subscription.stripe_price_id);
  const isActive = isSubscriptionActive(
    subscription.subscription_status,
    subscription.current_period_end
  );

  if (!currentPlan || !isActive) {
    return {
      hasAccess: false,
      currentPlan: null,
      requiredPlan: 'STARTER',
      reason: 'No active subscription',
    };
  }

  const maxUnits = PLANS[currentPlan].maxUnits;

  // Enterprise has unlimited units
  if (currentPlan === 'ENTERPRISE') {
    return { hasAccess: true, currentPlan };
  }

  const hasAccess = currentUnitCount < maxUnits;

  if (!hasAccess) {
    // Suggest next tier
    const nextPlan = currentPlan === 'STARTER' ? 'PROFESSIONAL' : 'ENTERPRISE';
    return {
      hasAccess: false,
      currentPlan,
      requiredPlan: nextPlan,
      reason: `You've reached the ${maxUnits} unit limit for the ${PLANS[currentPlan].name} plan. Upgrade to ${PLANS[nextPlan].name} for ${PLANS[nextPlan].maxUnits}${nextPlan === 'ENTERPRISE' ? '+' : ''} units.`,
    };
  }

  return { hasAccess: true, currentPlan };
}

/**
 * Get human-readable subscription status
 */
export function getSubscriptionStatusText(status: SubscriptionStatus): {
  text: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
} {
  switch (status) {
    case 'active':
      return { text: 'Activo', variant: 'default' };
    case 'trialing':
      return { text: 'Período de prueba', variant: 'secondary' };
    case 'past_due':
      return { text: 'Pago vencido', variant: 'destructive' };
    case 'canceled':
      return { text: 'Cancelado', variant: 'secondary' };
    case 'incomplete':
    case 'incomplete_expired':
      return { text: 'Incompleto', variant: 'destructive' };
    case 'unpaid':
      return { text: 'Impago', variant: 'destructive' };
    default:
      return { text: 'Inactivo', variant: 'outline' };
  }
}
