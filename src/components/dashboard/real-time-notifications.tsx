'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { toast } from 'sonner';

interface RealtimeNotificationsProps {
  buildingId: string;
}

const priorityConfig = {
  emergency: { icon: '🚨', label: 'Emergencia' },
  high: { icon: '⚠️', label: 'Alta' },
  medium: { icon: '📌', label: 'Media' },
  low: { icon: '📝', label: 'Baja' },
};

export function RealtimeNotifications({ buildingId }: RealtimeNotificationsProps) {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Subscribe to new notifications (created by webhook or other sources)
    const notificationsChannel = supabase
      .channel('global_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `building_id=eq.${buildingId}`,
        },
        async (payload) => {
          const notification = payload.new;

          console.log('[RealtimeNotifications] New notification received:', notification);

          // Show toast for all notification types
          const toastTitle = notification.title || 'Nueva Notificación';
          const toastDescription = notification.description || notification.message || '';

          // Choose toast variant based on type
          if (notification.type === 'message' || notification.type === 'new_message') {
            toast.info(toastTitle, {
              description: toastDescription,
              duration: 5000,
              action: notification.link ? {
                label: 'Ver',
                onClick: () => {
                  router.push(notification.link);
                },
              } : undefined,
            });
          } else if (notification.type === 'maintenance_request') {
            toast.warning(toastTitle, {
              description: toastDescription,
              duration: 6000,
              action: notification.link ? {
                label: 'Ver',
                onClick: () => {
                  router.push(notification.link);
                },
              } : undefined,
            });
          } else {
            toast(toastTitle, {
              description: toastDescription,
              duration: 5000,
            });
          }

          // Play notification sound
          playNotificationSound();
        }
      )
      .subscribe();

    // Subscribe to new maintenance requests
    const maintenanceChannel = supabase
      .channel('global_maintenance_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'maintenance_requests',
          filter: `building_id=eq.${buildingId}`,
        },
        async (payload) => {
          // Fetch the full request with resident info
          const { data: request } = await supabase
            .from('maintenance_requests')
            .select(`
              *,
              residents (
                first_name,
                last_name
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (request) {
            const priority = priorityConfig[request.priority as keyof typeof priorityConfig];
            const residentName = `${request.residents.first_name} ${request.residents.last_name}`;
            const description = `${priority.icon} ${priority.label} - ${residentName}: ${request.description.substring(0, 50)}...`;

            // Save notification to database
            await supabase.from('notifications').insert({
              building_id: buildingId,
              type: 'maintenance_request',
              title: 'Nueva Solicitud de Mantenimiento',
              description,
              reference_id: request.id,
              reference_type: 'maintenance_request',
              read: false,
              metadata: {
                priority: request.priority,
                category: request.category,
              },
            });

            // Show toast
            toast.success('Nueva Solicitud de Mantenimiento', {
              description,
              duration: 6000,
              action: {
                label: 'Ver',
                onClick: () => {
                  router.push('/dashboard/maintenance');
                },
              },
            });

            // Play notification sound
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(maintenanceChannel);
    };
  }, [buildingId, supabase]);

  return null; // This component doesn't render anything
}

function playNotificationSound() {
  if (typeof Audio !== 'undefined') {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Silently fail if audio playback is blocked
      });
    } catch {
      // Silently fail if Audio is not supported
    }
  }
}
