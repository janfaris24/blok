'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Lock, ArrowRight } from 'lucide-react';
import { PLANS, type PlanType } from '@/lib/stripe-plans';
import { useRouter } from 'next/navigation';

interface UpgradePromptProps {
  currentPlan: PlanType | null;
  requiredPlan: PlanType;
  feature: string;
  description?: string;
  inline?: boolean;
}

export function UpgradePrompt({
  currentPlan,
  requiredPlan,
  feature,
  description,
  inline = false,
}: UpgradePromptProps) {
  const router = useRouter();
  const requiredPlanDetails = PLANS[requiredPlan];

  if (inline) {
    // Inline version - small banner
    return (
      <div className="border border-primary/20 bg-primary/5 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">
              {feature} requiere el plan {requiredPlanDetails.name}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        <Button
          onClick={() => router.push('/dashboard/settings?tab=billing')}
          size="sm"
        >
          Mejorar Plan
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  // Card version - full upgrade prompt
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <Badge className="bg-primary">
            {requiredPlanDetails.name}
          </Badge>
        </div>
        <CardTitle>Mejora para desbloquear {feature}</CardTitle>
        <CardDescription>
          {description || `Esta función requiere el plan ${requiredPlanDetails.name} o superior.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Plan actual:</span>
            <span className="font-medium">
              {currentPlan ? PLANS[currentPlan].name : 'Ninguno'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Plan requerido:</span>
            <span className="font-medium">{requiredPlanDetails.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Precio:</span>
            <div className="text-right">
              <span className="text-2xl font-bold">${requiredPlanDetails.price}</span>
              <span className="text-muted-foreground text-sm">/mes</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm font-medium mb-2">Incluye:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {requiredPlanDetails.features.slice(0, 3).map((feat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>{feat}</span>
              </li>
            ))}
            {requiredPlanDetails.features.length > 3 && (
              <li className="text-xs italic">
                +{requiredPlanDetails.features.length - 3} más...
              </li>
            )}
          </ul>
        </div>

        <Button
          onClick={() => router.push('/dashboard/settings?tab=billing')}
          className="w-full"
          size="lg"
        >
          Mejorar a {requiredPlanDetails.name}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
