'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Building2, MessageSquare, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { type UsageStats } from '@/lib/usage-tracking';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/contexts/language-context';

interface UsageStatsCardProps {
  stats: UsageStats;
}

export function UsageStatsCard({ stats }: UsageStatsCardProps) {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {t.usage.planUsage}
        </CardTitle>
        <CardDescription>
          {t.usage.currentUsage} {stats.plan.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Unit Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t.usage.units}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {stats.units.current} / {stats.units.limit}
              </span>
              {stats.units.isAtLimit ? (
                <Badge variant="destructive" className="text-xs">
                  {t.usage.limitReached}
                </Badge>
              ) : stats.units.isNearLimit ? (
                <Badge variant="secondary" className="text-xs">
                  {t.usage.nearLimit}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  {stats.units.percentage}%
                </Badge>
              )}
            </div>
          </div>

          <Progress
            value={stats.units.percentage}
            className={`h-2 ${
              stats.units.isAtLimit
                ? '[&>div]:bg-destructive'
                : stats.units.isNearLimit
                ? '[&>div]:bg-yellow-500'
                : ''
            }`}
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {stats.units.remaining > 0
                ? `${stats.units.remaining} ${t.usage.unitsAvailable}`
                : t.usage.noUnitsAvailable}
            </span>
            {stats.units.percentage > 0 && (
              <span>{stats.units.percentage}% {t.usage.used}</span>
            )}
          </div>

          {/* Warning when at or near limit */}
          {stats.units.isAtLimit && (
            <Alert variant="destructive" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t.usage.limitReachedWarning
                  .replace('{limit}', stats.units.limit.toString())
                  .replace('{plan}', stats.plan.name)}
              </AlertDescription>
            </Alert>
          )}

          {stats.units.isNearLimit && !stats.units.isAtLimit && (
            <Alert className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t.usage.nearLimitWarning.replace('{remaining}', stats.units.remaining.toString())}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Broadcast Usage (if Professional+) */}
        {stats.features.broadcasts && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t.usage.broadcastsThisMonth}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">
                  {stats.broadcasts.current}
                </span>
                <Badge variant="outline" className="text-xs">
                  {t.usage.unlimited}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Feature Access Summary */}
        <div className="pt-3 border-t space-y-2">
          <p className="text-sm font-medium mb-2">{t.usage.includedFeatures}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span>{t.usage.whatsappMessaging}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span>{t.usage.aiResponses}</span>
            </div>
            {stats.features.broadcasts ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span>{t.usage.massBroadcasts}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30" />
                <span>{t.usage.massBroadcasts}</span>
              </div>
            )}
            {stats.features.analytics ? (
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                <span>{t.usage.advancedAnalytics}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30" />
                <span>{t.usage.advancedAnalytics}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
