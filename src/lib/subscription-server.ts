import { createClient } from '@/lib/supabase-server';
import {
  checkFeatureAccess,
  checkUnitLimit,
  isSubscriptionActive,
  type SubscriptionData,
  type FeatureAccess,
} from './subscription';

/**
 * Check if running in development environment
 */
function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' ||
         process.env.VERCEL_ENV === 'preview' ||
         (process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ?? false);
}

/**
 * Get subscription data for the current authenticated user
 */
export async function getSubscription(): Promise<SubscriptionData | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: building } = await supabase
    .from('buildings')
    .select('stripe_subscription_id, stripe_price_id, subscription_status, current_period_end, cancel_at_period_end')
    .eq('admin_user_id', user.id)
    .single();

  if (!building) return null;

  return {
    stripe_subscription_id: building.stripe_subscription_id,
    stripe_price_id: building.stripe_price_id,
    subscription_status: building.subscription_status as any,
    current_period_end: building.current_period_end,
    cancel_at_period_end: building.cancel_at_period_end,
  };
}

/**
 * Require active subscription - use in API routes
 * Throws error if no active subscription
 * DEV MODE: Bypasses subscription check in development/preview environments
 */
export async function requireSubscription(): Promise<SubscriptionData> {
  // DEV MODE: Skip subscription check in development/preview
  if (isDevelopment()) {
    console.log('[DEV MODE] Bypassing subscription check');
    return {
      stripe_subscription_id: 'dev_subscription',
      stripe_price_id: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || null,
      subscription_status: 'active',
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
    };
  }

  const subscription = await getSubscription();

  if (!subscription) {
    throw new Error('No subscription found');
  }

  if (!isSubscriptionActive(subscription.subscription_status, subscription.current_period_end)) {
    throw new Error('Subscription is not active');
  }

  return subscription;
}

/**
 * Require specific feature access - use in API routes
 * Throws error if feature not available
 */
export async function requireFeature(
  feature: 'broadcasts' | 'analytics' | 'service_providers' | 'knowledge_base' | 'basic'
): Promise<FeatureAccess> {
  const subscription = await requireSubscription();
  const access = checkFeatureAccess(subscription, feature);

  if (!access.hasAccess) {
    throw new Error(access.reason || 'Feature not available on your plan');
  }

  return access;
}

/**
 * Check if user can add more units
 */
export async function requireUnitCapacity(): Promise<FeatureAccess> {
  const supabase = await createClient();
  const subscription = await requireSubscription();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get building
  const { data: building } = await supabase
    .from('buildings')
    .select('id')
    .eq('admin_user_id', user.id)
    .single();

  if (!building) throw new Error('Building not found');

  // Get unit count
  const { count } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', building.id);

  const access = checkUnitLimit(subscription, count || 0);

  if (!access.hasAccess) {
    throw new Error(access.reason || 'Unit limit reached');
  }

  return access;
}
