'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BroadcastSkeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { formatDate } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Broadcast } from '@/types/blok';

interface EmailStats {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  openRate: number;
  clickRate: number;
}

interface BroadcastsListProps {
  initialBroadcasts: Broadcast[];
  buildingId: string;
  isLoading?: boolean;
}

export function BroadcastsList({ initialBroadcasts, buildingId, isLoading = false }: BroadcastsListProps) {
  const [broadcasts, setBroadcasts] = useState(initialBroadcasts);
  const [expandedBroadcast, setExpandedBroadcast] = useState<string | null>(null);
  const [emailStats, setEmailStats] = useState<Record<string, EmailStats>>({});
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});
  const supabase = createClient();

  // Update broadcasts when initialBroadcasts prop changes
  useEffect(() => {
    setBroadcasts(initialBroadcasts);
  }, [initialBroadcasts]);

  // Fetch email stats for a broadcast
  const fetchEmailStats = async (broadcastId: string) => {
    if (emailStats[broadcastId]) {
      // Already loaded
      return;
    }

    setLoadingStats((prev) => ({ ...prev, [broadcastId]: true }));

    try {
      const response = await fetch(`/api/broadcasts/email-stats?broadcastId=${broadcastId}`);
      if (response.ok) {
        const data = await response.json();
        setEmailStats((prev) => ({ ...prev, [broadcastId]: data.stats }));
      }
    } catch (error) {
      console.error('Failed to fetch email stats:', error);
    } finally {
      setLoadingStats((prev) => ({ ...prev, [broadcastId]: false }));
    }
  };

  // Toggle expanded broadcast
  const toggleExpand = (broadcastId: string, sendViaEmail: boolean) => {
    if (expandedBroadcast === broadcastId) {
      setExpandedBroadcast(null);
    } else {
      setExpandedBroadcast(broadcastId);
      if (sendViaEmail) {
        fetchEmailStats(broadcastId);
      }
    }
  };

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('broadcasts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'broadcasts',
          filter: `building_id=eq.${buildingId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBroadcasts((prev) => [payload.new as Broadcast, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBroadcasts((prev) =>
              prev.map((b) => (b.id === payload.new.id ? payload.new as Broadcast : b))
            );
          } else if (payload.eventType === 'DELETE') {
            setBroadcasts((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buildingId, supabase]);

  // Show loading skeletons
  if (isLoading) {
    return (
      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Anuncios Anteriores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <BroadcastSkeleton />
          <BroadcastSkeleton />
          <BroadcastSkeleton />
        </CardContent>
      </Card>
    );
  }

  // Show empty state
  if (broadcasts.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No hay anuncios todavía. Crea tu primer anuncio arriba.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Anuncios Anteriores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {broadcasts.map((broadcast) => {
          const statusConfig = {
            draft: { label: 'Borrador', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
            sending: { label: 'Enviando', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
            sent: { label: 'Enviado', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
            failed: { label: 'Fallido', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
          };

          const audienceConfig = {
            all: 'Todos',
            owners: 'Dueños',
            renters: 'Inquilinos',
            specific_units: 'Unidades Específicas',
          };

          const status = statusConfig[broadcast.status];
          const audience = audienceConfig[broadcast.target_audience];

          const isExpanded = expandedBroadcast === broadcast.id;
          const stats = emailStats[broadcast.id];
          const isLoadingStats = loadingStats[broadcast.id];

          return (
            <div
              key={broadcast.id}
              className="p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-medium text-sm">{broadcast.subject}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {broadcast.message}
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span>{formatDate(broadcast.created_at)}</span>
                <span>•</span>
                <span>{audience}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {broadcast.send_via_whatsapp && <span>📱</span>}
                  {broadcast.send_via_email && <span>📧</span>}
                  {broadcast.send_via_sms && <span>💬</span>}
                </div>
                {broadcast.status === 'sent' && (
                  <>
                    <span>•</span>
                    <span className="text-green-600 dark:text-green-400">
                      ✓ {broadcast.sent_count} enviados
                    </span>
                    {broadcast.failed_count > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-red-600 dark:text-red-400">
                          ✗ {broadcast.failed_count} fallidos
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Email tracking stats - expandable */}
              {broadcast.send_via_email && broadcast.status === 'sent' && (
                <>
                  <button
                    onClick={() => toggleExpand(broadcast.id, broadcast.send_via_email)}
                    className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? 'Ocultar' : 'Ver'} estadísticas de email
                  </button>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border/40">
                      {isLoadingStats ? (
                        <div className="flex items-center justify-center gap-2 py-4">
                          <Spinner size="sm" />
                          <p className="text-xs text-muted-foreground">Cargando estadísticas...</p>
                        </div>
                      ) : stats ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <div className="text-lg font-semibold">{stats.delivered}</div>
                            <div className="text-xs text-muted-foreground">Entregados</div>
                          </div>
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                              {stats.opened}
                            </div>
                            <div className="text-xs text-muted-foreground">Abiertos ({stats.openRate}%)</div>
                          </div>
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                              {stats.clicked}
                            </div>
                            <div className="text-xs text-muted-foreground">Clicks ({stats.clickRate}%)</div>
                          </div>
                          <div className="text-center p-2 bg-muted/30 rounded">
                            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                              {stats.bounced}
                            </div>
                            <div className="text-xs text-muted-foreground">Rebotados</div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No hay estadísticas disponibles</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
