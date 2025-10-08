'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, MessageSquare, Wrench, Megaphone, Check, CheckCheck, X, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Notification {
  id: string;
  type: 'new_message' | 'message' | 'maintenance_request' | 'broadcast' | 'system';
  title: string;
  description?: string;
  message?: string;
  reference_id?: string;
  reference_type?: 'conversation' | 'maintenance_request';
  link?: string;
  read: boolean;
  created_at: string;
  metadata: any;
}

interface NotificationsPanelProps {
  buildingId: string;
  onClose?: () => void;
}

export function NotificationsPanel({ buildingId, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
      .limit(20);

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

  async function dismissNotification(notificationId: string, e: React.MouseEvent) {
    e.stopPropagation(); // Prevent notification click
    
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error dismissing notification:', error);
      return;
    }

    // Update local state
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }

  async function clearAllRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('building_id', buildingId)
      .eq('read', false);

    if (error) {
      console.error('Error clearing notifications:', error);
      return;
    }

    // Update local state
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  }

  function handleNotificationClick(notification: Notification) {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Close the sheet/panel
    onClose?.();

    // Small delay to let the sheet close animation complete
    setTimeout(() => {
      // Navigate using link field if available (preferred)
      if (notification.link) {
        router.push(notification.link);
        return;
      }

      // Fallback to reference_type navigation
      if (notification.reference_type === 'conversation' && notification.reference_id) {
        router.push(`/dashboard/conversations?conversation=${notification.reference_id}`);
      } else if (notification.reference_type === 'maintenance_request') {
        router.push('/dashboard/maintenance');
      }
    }, 100);
  }

  const unreadNotifications = notifications.filter((n) => !n.read);

  function getIcon(type: string) {
    switch (type) {
      case 'new_message':
      case 'message':
        return MessageSquare;
      case 'maintenance_request':
        return Wrench;
      case 'broadcast':
        return Megaphone;
      default:
        return Bell;
    }
  }

  function getIconColor(type: string) {
    switch (type) {
      case 'new_message':
      case 'message':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30';
      case 'maintenance_request':
        return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30';
      case 'broadcast':
        return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/30';
    }
  }

  return (
    <div className="flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="border-b border-border/40 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <h2 className="font-semibold text-sm">Notificaciones</h2>
          {unreadNotifications.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-medium">
              {unreadNotifications.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-7 px-2 text-xs gap-1"
            >
              <CheckCheck className="w-3 h-3" />
              Marcar leídas
            </Button>
          )}
          {notifications.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={markAllAsRead} className="text-xs gap-2">
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todas leídas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Cargando...
          </div>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map((notification) => {
              const Icon = getIcon(notification.type);
              const iconColor = getIconColor(notification.type);
              const displayMessage = notification.message || notification.description || '';

              return (
                <div
                  key={notification.id}
                  className={`group px-4 py-3 border-b border-border/40 transition-colors hover:bg-muted/50 cursor-pointer relative ${
                    !notification.read ? 'bg-muted/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-medium text-sm line-clamp-1">
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                          )}
                          <button
                            onClick={(e) => dismissNotification(notification.id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted/20 rounded"
                            title="Marcar como leída"
                          >
                            <Check className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                      {displayMessage && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                          {displayMessage}
                        </p>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(notification.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No hay notificaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}
