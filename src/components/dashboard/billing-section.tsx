'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Loader2, Sparkles } from 'lucide-react';
import { PLANS, type PlanType } from '@/lib/stripe-plans';
import { useLanguage } from '@/contexts/language-context';
import { translations } from '@/lib/translations';
import { UsageStatsCard } from './usage-stats-card';
import { type UsageStats } from '@/lib/usage-tracking';

interface BillingSectionProps {
  building: {
    id: string;
    name: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    stripe_price_id: string | null;
    subscription_status: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean | null;
  };
  usageStats?: UsageStats | null;
}

export function BillingSection({ building, usageStats }: BillingSectionProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Determine current plan
  const currentPlan = building.stripe_price_id
    ? Object.entries(PLANS).find(([_, plan]) => plan.priceId === building.stripe_price_id)?.[0] as PlanType | undefined
    : null;

  const isActive = building.subscription_status === 'active';
  const isPastDue = building.subscription_status === 'past_due';
  const willCancel = building.cancel_at_period_end;

  const handleSubscribe = async (priceId: string, planName: string) => {
    // If user already has a subscription, redirect to Customer Portal instead
    if (building.stripe_subscription_id) {
      handleManageBilling();
      return;
    }

    setLoadingPlan(planName);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error creating checkout session');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error initiating checkout');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error creating portal session');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error opening billing portal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {building.stripe_subscription_id && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t.settings.currentSubscription}
            </CardTitle>
            <CardDescription>
              {t.settings.manageSubscription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {t.settings.plan} {currentPlan ? PLANS[currentPlan].name : 'Unknown'}
                  </h3>
                  <Badge variant={isActive ? 'default' : isPastDue ? 'destructive' : 'secondary'}>
                    {isActive ? t.settings.active : isPastDue ? t.settings.pastDue : building.subscription_status}
                  </Badge>
                </div>
                {building.current_period_end && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {willCancel ? t.settings.cancelsOn : t.settings.renewsOn}{' '}
                    {new Date(building.current_period_end).toLocaleDateString(t === translations.es ? 'es-PR' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${currentPlan ? PLANS[currentPlan].price : 0}
                </p>
                <p className="text-sm text-muted-foreground">{t.settings.perMonth}</p>
              </div>
            </div>

            {isPastDue && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  {t.settings.pastDueWarning}
                </p>
              </div>
            )}

            <Button onClick={handleManageBilling} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.settings.loading}
                </>
              ) : (
                t.settings.manageBilling
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Usage Stats */}
      {usageStats && building.stripe_subscription_id && (
        <UsageStatsCard stats={usageStats} />
      )}

      {/* Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          {building.stripe_subscription_id ? t.settings.changePlan : t.settings.choosePlan}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([key, plan]) => {
            const isCurrent = currentPlan === key;
            const isLoadingThis = loadingPlan === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative ${isCurrent ? 'border-primary border-2' : ''}`}
              >
                {key === 'PROFESSIONAL' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-secondary">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {t.settings.mostPopular}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {isCurrent && (
                      <Badge variant="outline">{t.settings.currentPlan}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {t.settings.upTo} {plan.maxUnits} {t.settings.units}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">{t.settings.perMonth}</span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.priceId, plan.id)}
                    disabled={isCurrent || isLoadingThis}
                    variant={isCurrent ? 'secondary' : 'default'}
                    className="w-full"
                  >
                    {isLoadingThis ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.settings.processing}
                      </>
                    ) : isCurrent ? (
                      t.settings.currentPlan
                    ) : building.stripe_subscription_id ? (
                      t.settings.changePlan
                    ) : (
                      t.settings.selectPlan
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
