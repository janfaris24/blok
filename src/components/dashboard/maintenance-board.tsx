'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-client';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import { AlertCircle, Clock, CheckCircle2, XCircle, Wrench, Camera, Image as ImageIcon } from 'lucide-react';
import { MaintenanceDetailModal } from './maintenance-detail-modal';

interface MaintenanceRequest {
  id: string;
  title?: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reported_at: string;
  resolved_at?: string | null;
  photo_urls?: string[] | null;
  has_photos?: boolean;
  location?: string | null;
  conversation_id?: string | null;
  residents: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    type: string;
  };
  units?: {
    unit_number: string;
  } | null;
}

interface MaintenanceBoardProps {
  initialRequests: MaintenanceRequest[];
  buildingId: string;
}

const columns = [
  {
    id: 'open',
    title: 'Abiertas',
    icon: AlertCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/20',
  },
  {
    id: 'in_progress',
    title: 'En Progreso',
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
  },
  {
    id: 'resolved',
    title: 'Resueltas',
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
  {
    id: 'closed',
    title: 'Cerradas',
    icon: XCircle,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
];

const priorityConfig = {
  emergency: {
    label: 'Emergencia',
    color: 'bg-red-600 text-white',
    icon: '🚨',
  },
  high: {
    label: 'Alta',
    color: 'bg-orange-500 text-white',
    icon: '⚠️',
  },
  medium: {
    label: 'Media',
    color: 'bg-yellow-500 text-white',
    icon: '📌',
  },
  low: {
    label: 'Baja',
    color: 'bg-blue-500 text-white',
    icon: '📝',
  },
};

export function MaintenanceBoard({ initialRequests, buildingId }: MaintenanceBoardProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Real-time subscription for maintenance request updates
  useEffect(() => {
    const channel = supabase
      .channel('maintenance_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests',
          filter: `building_id=eq.${buildingId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new request with full relations
            const { data: newRequest } = await supabase
              .from('maintenance_requests')
              .select(`
                *,
                residents (
                  id,
                  first_name,
                  last_name,
                  phone,
                  type
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (newRequest) {
              setRequests((prev) => [newRequest, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setRequests((prev) =>
              prev.map((req) =>
                req.id === payload.new.id
                  ? { ...req, ...payload.new }
                  : req
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buildingId, supabase]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const requestId = active.id as string;
    const newStatus = over.id as string;

    // Update locally
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: newStatus as any }
          : req
      )
    );

    // Update via API (handles notification if status is closed)
    try {
      const response = await fetch('/api/maintenance/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          newStatus,
        }),
      });

      if (!response.ok) {
        console.error('Failed to update status');
        // Revert local update on error
        const { data: currentRequest } = await supabase
          .from('maintenance_requests')
          .select('status')
          .eq('id', requestId)
          .single();

        if (currentRequest) {
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? { ...req, status: currentRequest.status }
                : req
            )
          );
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }

    setActiveId(null);
  }

  function handleRequestClick(request: MaintenanceRequest) {
    setSelectedRequest(request);
    setIsModalOpen(true);
  }

  async function handleStatusChange(requestId: string, newStatus: string) {
    // Update locally
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: newStatus as any }
          : req
      )
    );

    // Update via API (handles notification if status is closed)
    try {
      const response = await fetch('/api/maintenance/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          newStatus,
        }),
      });

      if (!response.ok) {
        console.error('Failed to update status');
        // Revert local update on error
        const { data: currentRequest } = await supabase
          .from('maintenance_requests')
          .select('status')
          .eq('id', requestId)
          .single();

        if (currentRequest) {
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? { ...req, status: currentRequest.status }
                : req
            )
          );
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  const getRequestsByStatus = (status: string) => {
    return requests.filter((req) => req.status === status);
  };

  const activeRequest = requests.find((req) => req.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => {
          const columnRequests = getRequestsByStatus(column.id);

          return (
            <Card key={column.id} className="flex flex-col h-[calc(100vh-16rem)] border-border/40">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className={`p-1.5 rounded-lg ${column.bgColor}`}>
                    <column.icon className={`w-4 h-4 ${column.color}`} />
                  </div>
                  <div>
                    {column.title}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      ({columnRequests.length})
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-3">
                <DroppableColumn id={column.id}>
                  <div className="space-y-2">
                    {columnRequests.map((request) => (
                      <DraggableCard
                        key={request.id}
                        request={request}
                        onClick={() => handleRequestClick(request)}
                      />
                    ))}

                    {columnRequests.length === 0 && (
                      <div className="text-center text-muted-foreground py-6 text-sm">
                        Sin solicitudes
                      </div>
                    )}
                  </div>
                </DroppableColumn>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DragOverlay>
        {activeRequest ? <RequestCard request={activeRequest} isDragging /> : null}
      </DragOverlay>

      {/* Detail Modal */}
      <MaintenanceDetailModal
        request={selectedRequest}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </DndContext>
  );
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="min-h-[200px]">
      {children}
    </div>
  );
}

function DraggableCard({
  request,
  onClick,
}: {
  request: MaintenanceRequest;
  onClick?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: request.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const priority = priorityConfig[request.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Only trigger onClick if not dragging
        if (!isDragging && onClick) {
          onClick();
        }
      }}
      className={`p-3 rounded-lg border border-border/40 bg-card cursor-pointer hover:shadow-md transition-all ${
        isDragging ? 'opacity-50 rotate-2 scale-105 cursor-grabbing' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${priority.color}`}>
          {priority.icon} {priority.label}
        </span>
        <Wrench className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      </div>

      <p className="font-medium text-sm mb-2 line-clamp-2">
        {request.description}
      </p>

      <div className="space-y-1 text-xs">
        <p className="text-muted-foreground">
          <span className="font-medium">Categoría:</span> {request.category}
        </p>
        <p className="text-muted-foreground truncate">
          <span className="font-medium">Residente:</span>{' '}
          {request.residents.first_name} {request.residents.last_name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            {formatRelativeTime(request.reported_at)}
          </p>
          {request.has_photos && request.photo_urls && request.photo_urls.length > 0 && (
            <Badge variant="secondary" className="gap-1 h-5 px-1.5">
              <Camera className="w-3 h-3" />
              <span className="text-[10px]">{request.photo_urls.length}</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Photo preview */}
      {request.has_photos && request.photo_urls && request.photo_urls.length > 0 && (
        <div className="mt-2 flex gap-1 overflow-x-auto">
          {request.photo_urls.slice(0, 3).map((url, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={url}
                alt={`Photo ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </a>
          ))}
          {request.photo_urls.length > 3 && (
            <div className="flex-shrink-0 w-16 h-16 rounded-md bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
              +{request.photo_urls.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
  isDragging = false,
}: {
  request: MaintenanceRequest;
  isDragging?: boolean;
}) {
  const priority = priorityConfig[request.priority];

  return (
    <div
      className={`p-3 rounded-lg border border-border/40 bg-card transition-all ${
        isDragging ? 'opacity-50 rotate-3 scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${priority.color}`}>
          {priority.icon} {priority.label}
        </span>
        <Wrench className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      </div>

      <p className="font-medium text-sm mb-2 line-clamp-2">
        {request.description}
      </p>

      <div className="space-y-1 text-xs">
        <p className="text-muted-foreground">
          <span className="font-medium">Categoría:</span> {request.category}
        </p>
        <p className="text-muted-foreground truncate">
          <span className="font-medium">Residente:</span>{' '}
          {request.residents.first_name} {request.residents.last_name}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {formatRelativeTime(request.reported_at)}
        </p>
      </div>
    </div>
  );
}
