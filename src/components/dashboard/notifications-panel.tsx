'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, MessageSquare, Wrench, Check, X } from 'lucide-react';
import { LaserFlow } from '@/components/ui/laser-flow';

interface Notification {
  id: string;
  type: 'message' | 'maintenance_request';
  title: string;
  description: string;
  reference_id: string;
  reference_type: 'conversation' | 'maintenance_request';
  read: boolean;
  created_at: string;
  metadata: any;
}

interface NotificationsPanelProps {
  buildingId: string;
}

export function NotificationsPanel({ buildingId }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
  }, [buildingId]);

  // Real-time subscription for new notifications
  useEffect(() => {
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `building_id=eq.${buildingId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `building_id=eq.${buildingId}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === payload.new.id ? (payload.new as Notification) : notif
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buildingId, supabase]);

  async function loadNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  }

  async function markAsRead(notificationId: string) {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);
  }

  async function markAsUnread(notificationId: string) {
    await supabase
      .from('notifications')
      .update({ read: false })
      .eq('id', notificationId);
  }

  async function markAllAsRead() {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('building_id', buildingId)
      .eq('read', false);

    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  }

  function handleNotificationClick(notification: Notification) {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to the appropriate page
    if (notification.reference_type === 'conversation') {
      router.push(`/dashboard/conversations?conversation=${notification.reference_id}`);
    } else if (notification.reference_type === 'maintenance_request') {
      router.push('/dashboard/maintenance');
    }
  }

  const filteredNotifications = notifications.filter((notif) =>
    filter === 'all' ? true : !notif.read
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header with LaserFlow */}
      <div className="border-b border-border/40 px-5 py-4 relative overflow-hidden">
        {unreadCount > 0 && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <LaserFlow
              color="#ef4444"
              horizontalBeamOffset={0.5}
              verticalBeamOffset={0.5}
              flowSpeed={0.4}
              wispDensity={1.0}
              fogIntensity={0.35}
            />
          </div>
        )}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Notificaciones</h2>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 text-xs"
              >
                Marcar leídas
              </Button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="h-8 text-xs"
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="h-8 text-xs"
            >
              No leídas ({unreadCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Cargando notificaciones...
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-border/40">
            {filteredNotifications.map((notification) => {
              const isMessage = notification.type === 'message';
              const Icon = isMessage ? MessageSquare : Wrench;

              return (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors hover:bg-muted/50 cursor-pointer ${
                    !notification.read ? 'bg-muted/30' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isMessage
                          ? 'bg-blue-50 dark:bg-blue-950/30'
                          : 'bg-green-50 dark:bg-green-950/30'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isMessage
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                        <div className="flex gap-1">
                          {notification.read ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsUnread(notification.id);
                              }}
                              className="h-7 px-2 text-[11px]"
                            >
                              <X className="w-3 h-3 mr-1" />
                              No leída
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="h-7 px-2 text-[11px]"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Leída
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              {filter === 'unread'
                ? 'No hay notificaciones sin leer'
                : 'No hay notificaciones'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
