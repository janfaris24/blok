import { createClient } from './supabase-server';
import { getPlanFromPriceId, type SubscriptionData } from './subscription';
import { PLANS, type PlanType } from './stripe-plans';

export interface UsageStats {
  // Unit/resident limits
  units: {
    current: number;
    limit: number;
    percentage: number;
    remaining: number;
    isNearLimit: boolean; // >80%
    isAtLimit: boolean; // >=100%
  };

  // Broadcast limits (if we add them later)
  broadcasts: {
    current: number;
    limit: number | null; // null = unlimited
  };

  // Feature access
  features: {
    broadcasts: boolean;
    analytics: boolean;
    serviceProviders: boolean;
    knowledgeBase: boolean;
  };

  // Plan info
  plan: {
    name: string;
    tier: PlanType;
    price: number;
  };
}

/**
 * Get comprehensive usage statistics for a building
 */
export async function getUsageStats(buildingId: string, subscription: SubscriptionData): Promise<UsageStats> {
  const supabase = await createClient();

  // Get current plan
  const currentPlan = getPlanFromPriceId(subscription.stripe_price_id);

  if (!currentPlan) {
    throw new Error('No active subscription plan found');
  }

  const planDetails = PLANS[currentPlan];

  // Count current units
  const { count: unitCount } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', buildingId);

  const currentUnits = unitCount || 0;
  const unitLimit = planDetails.maxUnits;
  const unitPercentage = (currentUnits / unitLimit) * 100;

  // Count broadcasts sent this month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const { count: broadcastCount } = await supabase
    .from('broadcasts')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', buildingId)
    .gte('created_at', firstDayOfMonth.toISOString());

  // Determine feature access based on plan
  const hasProfessionalFeatures = currentPlan === 'PROFESSIONAL' || currentPlan === 'ENTERPRISE';

  return {
    units: {
      current: currentUnits,
      limit: unitLimit,
      percentage: Math.round(unitPercentage),
      remaining: Math.max(0, unitLimit - currentUnits),
      isNearLimit: unitPercentage >= 80,
      isAtLimit: currentUnits >= unitLimit,
    },
    broadcasts: {
      current: broadcastCount || 0,
      limit: null, // Currently unlimited
    },
    features: {
      broadcasts: hasProfessionalFeatures,
      analytics: hasProfessionalFeatures,
      serviceProviders: hasProfessionalFeatures,
      knowledgeBase: hasProfessionalFeatures,
    },
    plan: {
      name: planDetails.name,
      tier: currentPlan,
      price: planDetails.price,
    },
  };
}

/**
 * Get just the unit count (faster query for limit checks)
 */
export async function getUnitCount(buildingId: string): Promise<number> {
  const supabase = await createClient();

  const { count } = await supabase
    .from('units')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', buildingId);

  return count || 0;
}

/**
 * Check if building can add more units
 */
export async function canAddUnits(buildingId: string, subscription: SubscriptionData): Promise<boolean> {
  const currentPlan = getPlanFromPriceId(subscription.stripe_price_id);

  if (!currentPlan) {
    return false;
  }

  // Enterprise has unlimited units
  if (currentPlan === 'ENTERPRISE') {
    return true;
  }

  const unitCount = await getUnitCount(buildingId);
  const limit = PLANS[currentPlan].maxUnits;

  return unitCount < limit;
}

/**
 * Get broadcast count for current month
 */
export async function getBroadcastCount(buildingId: string): Promise<number> {
  const supabase = await createClient();

  // Get first day of current month
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('broadcasts')
    .select('*', { count: 'exact', head: true })
    .eq('building_id', buildingId)
    .gte('created_at', firstDayOfMonth.toISOString());

  return count || 0;
}
