'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { Broadcast } from '@/types/blok';

interface BroadcastsListProps {
  initialBroadcasts: Broadcast[];
  buildingId: string;
}

export function BroadcastsList({ initialBroadcasts, buildingId }: BroadcastsListProps) {
  const [broadcasts, setBroadcasts] = useState(initialBroadcasts);
  const supabase = createClient();

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

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatDate(broadcast.created_at)}</span>
                <span>•</span>
                <span>{audience}</span>
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
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
