'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Wrench,
  AlertCircle,
  Clock,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Bot,
  Sparkles,
  ExternalLink,
  Bell,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface DashboardClientProps {
  buildingName: string;
  stats: {
    activeConversations: number;
    totalConversations: number;
    totalResidents: number;
    openRequests: number;
    totalMaintenanceRequests: number;
    inProgressRequests: number;
  };
  recentConversations: any[];
  recentRequests: any[];
}

interface AISummary {
  summary: string;
  priority_alert: string | null;
  insights: string[];
  recommendations: string[];
  stats: {
    todayMessages: number;
    todayRequests: number;
    openRequests: number;
    urgentRequests: number;
    activeConversations: number;
  };
}

export function DashboardClient({
  buildingName,
  stats,
  recentConversations,
  recentRequests,
}: DashboardClientProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  // Fetch AI summary on mount (uses cache)
  useEffect(() => {
    fetchAISummary(false); // Don't force refresh on initial load
  }, []);

  async function fetchAISummary(forceRefresh = false) {
    setLoadingSummary(true);
    try {
      const url = forceRefresh
        ? '/api/dashboard/summary?refresh=true'
        : '/api/dashboard/summary';

      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        setAiSummary(result.data);

        if (forceRefresh) {
          console.log('[Dashboard] ✨ AI summary refreshed');
        } else if (result.data.cached) {
          console.log('[Dashboard] ⚡ Loaded from cache');
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI summary:', error);
    } finally {
      setLoadingSummary(false);
    }
  }

  const statsCards = [
    {
      title: t.dashboard.activeConversations,
      value: stats.activeConversations,
      total: stats.totalConversations,
      icon: Activity,
      description: `${stats.totalConversations} ${t.dashboard.total}`,
      href: '/dashboard/conversations',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: t.dashboard.totalResidents,
      value: stats.totalResidents,
      icon: Users,
      description: t.dashboard.ownersAndRenters,
      href: '/dashboard/residents',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: t.dashboard.openRequests,
      value: stats.openRequests,
      total: stats.totalMaintenanceRequests,
      icon: AlertCircle,
      description: `${stats.totalMaintenanceRequests} ${t.dashboard.total}`,
      href: '/dashboard/maintenance',
      color: 'from-red-500 to-orange-500',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-600 dark:text-red-400',
      urgent: stats.openRequests > 5,
    },
    {
      title: t.dashboard.inProgress,
      value: stats.inProgressRequests,
      icon: Clock,
      description: t.dashboard.maintenanceTasks,
      href: '/dashboard/maintenance',
      color: 'from-yellow-500 to-amber-500',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
  ];

  const statusConfig = {
    referred_to_provider: { label: t.maintenance.referred, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30' },
    open: { label: t.maintenance.opened, color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30' },
    in_progress: { label: t.maintenance.inProgress, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30' },
    resolved: { label: t.maintenance.resolved_single, color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30' },
    closed: { label: t.maintenance.closed_single, color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800' },
  };

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-0.5">{t.dashboard.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t.dashboard.summary} {buildingName}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchAISummary(true)}
          className="gap-2"
          disabled={loadingSummary}
        >
          <Sparkles className="w-4 h-4" />
          {loadingSummary ? 'Generando...' : 'Actualizar AI'}
        </Button>
      </div>

      {/* AI-Powered Summary Card */}
      {aiSummary && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  {t.dashboard.aiSummary || 'Resumen Inteligente'}
                  <Badge variant="secondary" className="gap-1 text-[10px] px-1.5 py-0">
                    <Zap className="w-2.5 h-2.5" />
                    AI
                  </Badge>
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <p className="text-sm leading-relaxed">{aiSummary.summary}</p>

            {/* Priority Alert */}
            {aiSummary.priority_alert && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-900/30">
                <Bell className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
                    Alerta Prioritaria
                  </p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80">
                    {aiSummary.priority_alert}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Hoy</p>
                <p className="text-lg font-bold">{aiSummary.stats.todayMessages}</p>
                <p className="text-[10px] text-muted-foreground">mensajes</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Nuevas</p>
                <p className="text-lg font-bold">{aiSummary.stats.todayRequests}</p>
                <p className="text-[10px] text-muted-foreground">solicitudes</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Abiertas</p>
                <p className="text-lg font-bold">{aiSummary.stats.openRequests}</p>
                <p className="text-[10px] text-muted-foreground">tareas</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Urgentes</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {aiSummary.stats.urgentRequests}
                </p>
                <p className="text-[10px] text-muted-foreground">críticas</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Activas</p>
                <p className="text-lg font-bold">{aiSummary.stats.activeConversations}</p>
                <p className="text-[10px] text-muted-foreground">chats</p>
              </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Insights */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" />
                  Insights
                </p>
                <div className="space-y-1.5">
                  {aiSummary.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3" />
                  Recomendaciones
                </p>
                <div className="space-y-1.5">
                  {aiSummary.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid - Enhanced & Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="border-border/40 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => router.push(stat.href)}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

            {/* Urgent Indicator */}
            {stat.urgent && (
              <div className="absolute top-2 right-2">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <CardDescription className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight">{stat.value.toLocaleString()}</p>
                {stat.total && (
                  <p className="text-sm text-muted-foreground">/ {stat.total}</p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Grid - Enhanced & Clickable */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Conversations */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">{t.dashboard.recentConversations}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/conversations')}
                className="h-7 text-xs gap-1"
              >
                Ver todas
                <ArrowUpRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentConversations.length > 0 ? (
              recentConversations.map((conv: any, idx: number) => (
                <div
                  key={conv.id}
                  onClick={() => router.push(`/dashboard/conversations?conversation=${conv.id}`)}
                  className={`flex items-center gap-3 py-3 hover:bg-muted/50 -mx-6 px-6 transition-all cursor-pointer group ${
                    idx !== recentConversations.length - 1 ? 'border-b border-border/40' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {conv.residents?.first_name} {conv.residents?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conv.status === 'active' ? t.dashboard.active : t.dashboard.closed}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      conv.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                    <ExternalLink className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8 text-xs">
                {t.dashboard.noConversations}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Maintenance Requests */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold">{t.dashboard.maintenanceRequests}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/maintenance')}
                className="h-7 text-xs gap-1"
              >
                Ver todas
                <ArrowUpRight className="w-3 h-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentRequests.length > 0 ? (
              recentRequests.map((request: any, idx: number) => {
                const status = statusConfig[request.status as keyof typeof statusConfig];
                const isUrgent = request.priority === 'emergency' || request.priority === 'high';

                return (
                  <div
                    key={request.id}
                    onClick={() => router.push('/dashboard/maintenance')}
                    className={`flex items-center gap-3 py-3 hover:bg-muted/50 -mx-6 px-6 transition-all cursor-pointer group ${
                      idx !== recentRequests.length - 1 ? 'border-b border-border/40' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${
                      isUrgent ? 'bg-red-500/10' : 'bg-orange-500/10'
                    }`}>
                      <Wrench className={`w-3.5 h-3.5 ${
                        isUrgent ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{request.description}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {request.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isUrgent && (
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                      <ExternalLink className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-8 text-xs">
                {t.dashboard.noRequests}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
