'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import {
  checkFeatureAccess,
  checkUnitLimit,
  isSubscriptionActive,
  getPlanFromPriceId,
  getSubscriptionStatusText,
  type SubscriptionData,
  type FeatureAccess,
} from '@/lib/subscription';
import { PLANS, type PlanType } from '@/lib/stripe-plans';

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unitCount, setUnitCount] = useState(0);

  useEffect(() => {
    async function loadSubscription() {
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get building with subscription data
      const { data: building } = await supabase
        .from('buildings')
        .select('stripe_subscription_id, stripe_price_id, subscription_status, current_period_end, cancel_at_period_end')
        .eq('admin_user_id', user.id)
        .single();

      if (building) {
        setSubscription({
          stripe_subscription_id: building.stripe_subscription_id,
          stripe_price_id: building.stripe_price_id,
          subscription_status: building.subscription_status as any,
          current_period_end: building.current_period_end,
          cancel_at_period_end: building.cancel_at_period_end,
        });

        // Get unit count
        const { count } = await supabase
          .from('units')
          .select('*', { count: 'exact', head: true });

        setUnitCount(count || 0);
      }

      setLoading(false);
    }

    loadSubscription();
  }, []);

  // Helper methods
  const hasFeature = (
    feature: 'broadcasts' | 'analytics' | 'service_providers' | 'knowledge_base' | 'basic'
  ): FeatureAccess => {
    if (!subscription) {
      return {
        hasAccess: false,
        currentPlan: null,
        requiredPlan: 'STARTER',
        reason: 'No subscription found',
      };
    }
    return checkFeatureAccess(subscription, feature);
  };

  const canAddUnits = (): FeatureAccess => {
    if (!subscription) {
      return {
        hasAccess: false,
        currentPlan: null,
        requiredPlan: 'STARTER',
        reason: 'No subscription found',
      };
    }
    return checkUnitLimit(subscription, unitCount);
  };

  const isActive = subscription
    ? isSubscriptionActive(subscription.subscription_status, subscription.current_period_end)
    : false;

  const currentPlan = subscription ? getPlanFromPriceId(subscription.stripe_price_id) : null;

  const statusDisplay = getSubscriptionStatusText(subscription?.subscription_status || null);

  const planDetails = currentPlan ? PLANS[currentPlan] : null;

  return {
    subscription,
    loading,
    isActive,
    currentPlan,
    planDetails,
    unitCount,
    statusDisplay,
    hasFeature,
    canAddUnits,
  };
}
