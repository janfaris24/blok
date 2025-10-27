'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatRelativeTime } from '@/lib/utils';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Camera,
  UserCheck,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Zap,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { MaintenanceDetailModal } from './maintenance-detail-modal';
import { useLanguage } from '@/contexts/language-context';
import { useDebounce } from '@/hooks/use-debounce';

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

// Category icons mapping
const categoryIcons: Record<string, any> = {
  plumbing: '🚰',
  electrical: '⚡',
  hvac: '❄️',
  appliance: '🔧',
  structural: '🏗️',
  cleaning: '🧹',
  security: '🔒',
  elevator: '🛗',
  parking: '🅿️',
  landscaping: '🌳',
  noise: '🔊',
  pest_control: '🐛',
  general: '📋',
  handyman: '🔧',
  washer_dryer_technician: '🧺',
};

export function MaintenanceBoard({ initialRequests, buildingId }: MaintenanceBoardProps) {
  const { t } = useLanguage();
  const [requests, setRequests] = useState(initialRequests);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const supabase = createClient();

  // Debounce search query for better performance (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const columns = [
    {
      id: 'referred_to_provider',
      title: t.maintenance.referredToProvider,
      icon: UserCheck,
      gradient: 'from-blue-500/80 to-cyan-500/80',
      textColor: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-50/50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200/50 dark:border-blue-800/50',
    },
    {
      id: 'open',
      title: t.maintenance.open,
      icon: AlertCircle,
      gradient: 'from-red-500/80 to-rose-500/80',
      textColor: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-50/50 dark:bg-red-950/20',
      borderColor: 'border-red-200/50 dark:border-red-800/50',
    },
    {
      id: 'in_progress',
      title: t.maintenance.inProgress,
      icon: Clock,
      gradient: 'from-amber-500/80 to-yellow-500/80',
      textColor: 'text-amber-700 dark:text-amber-300',
      bgColor: 'bg-amber-50/50 dark:bg-amber-950/20',
      borderColor: 'border-amber-200/50 dark:border-amber-800/50',
    },
    {
      id: 'resolved',
      title: t.maintenance.resolved,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/80 to-green-500/80',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      borderColor: 'border-emerald-200/50 dark:border-emerald-800/50',
    },
    {
      id: 'closed',
      title: t.maintenance.closed,
      icon: XCircle,
      gradient: 'from-slate-500/80 to-gray-500/80',
      textColor: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-50/50 dark:bg-slate-950/20',
      borderColor: 'border-slate-200/50 dark:border-slate-800/50',
    },
  ];

  const priorityConfig = {
    emergency: {
      label: t.maintenance.emergency,
      color: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-l-red-500/70',
      icon: AlertTriangle,
      dotColor: 'bg-red-500',
    },
    high: {
      label: t.maintenance.high,
      color: 'bg-orange-500',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-l-orange-500/70',
      icon: Zap,
      dotColor: 'bg-orange-500',
    },
    medium: {
      label: t.maintenance.medium,
      color: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-300',
      borderColor: 'border-l-amber-500/70',
      icon: Info,
      dotColor: 'bg-amber-500',
    },
    low: {
      label: t.maintenance.low,
      color: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-300',
      borderColor: 'border-l-blue-500/70',
      icon: Info,
      dotColor: 'bg-blue-500',
    },
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Real-time subscription
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
                ),
                units (
                  unit_number
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

  // Filtered requests with enhanced search
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Enhanced search: title, description, category, resident name, unit number
      const matchesSearch =
        debouncedSearchQuery === '' ||
        req.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        req.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        `${req.residents.first_name} ${req.residents.last_name}`
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        req.units?.unit_number.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      const matchesPriority =
        priorityFilter === 'all' || req.priority === priorityFilter;

      const matchesCategory =
        categoryFilter === 'all' || req.category === categoryFilter;

      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [requests, debouncedSearchQuery, priorityFilter, categoryFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredRequests.length;
    const urgent = filteredRequests.filter(
      (r) => r.priority === 'emergency' || r.priority === 'high'
    ).length;
    const inProgress = filteredRequests.filter((r) => r.status === 'in_progress').length;
    const resolved = filteredRequests.filter((r) => r.status === 'resolved').length;

    return { total, urgent, inProgress, resolved };
  }, [filteredRequests]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    return Array.from(new Set(requests.map((r) => r.category)));
  }, [requests]);

  // Translate category name
  const getCategoryName = (category: string) => {
    const translations = t.maintenance.categoryNames as Record<string, string>;
    return translations[category] || category;
  };

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

    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: newStatus as any }
          : req
      )
    );

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
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? { ...req, status: newStatus as any }
          : req
      )
    );

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
    return filteredRequests.filter((req) => req.status === status);
  };

  const activeRequest = requests.find((req) => req.id === activeId);

  return (
    <div className="space-y-4">
      {/* Board Header - Jira Style */}
      <div className="space-y-2.5">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Card className="border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">{t.maintenance.total}</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">{t.maintenance.urgent}</p>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">
                    {stats.urgent}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">{t.maintenance.inProgress}</p>
                  <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                  <Clock className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground font-medium">{t.maintenance.resolved}</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {stats.resolved}
                  </p>
                </div>
                <div className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="border-border/40">
          <CardContent className="p-3">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder={t.maintenance.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-20 h-9 text-sm"
                />
                {/* Clear button */}
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-16 top-1/2 -translate-y-1/2 h-6 w-6 hover:bg-muted"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
                {/* Search results count */}
                {debouncedSearchQuery && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {filteredRequests.length}
                  </div>
                )}
              </div>

              <div className="relative w-full md:w-[180px]">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <div className="flex items-center gap-1.5 w-full">
                      <Filter className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {priorityFilter === 'all' && t.maintenance.allPriorities}
                        {priorityFilter === 'emergency' && `🚨 ${t.maintenance.emergency}`}
                        {priorityFilter === 'high' && `⚡ ${t.maintenance.high}`}
                        {priorityFilter === 'medium' && `📌 ${t.maintenance.medium}`}
                        {priorityFilter === 'low' && `📝 ${t.maintenance.low}`}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.maintenance.allPriorities}</SelectItem>
                    <SelectItem value="emergency">🚨 {t.maintenance.emergency}</SelectItem>
                    <SelectItem value="high">⚡ {t.maintenance.high}</SelectItem>
                    <SelectItem value="medium">📌 {t.maintenance.medium}</SelectItem>
                    <SelectItem value="low">📝 {t.maintenance.low}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative w-full md:w-[180px]">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <div className="flex items-center gap-1.5 w-full">
                      <Filter className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">
                        {categoryFilter === 'all'
                          ? t.maintenance.allCategories
                          : `${categoryIcons[categoryFilter] || '📋'} ${getCategoryName(categoryFilter)}`}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.maintenance.allCategories}</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {categoryIcons[cat] || '📋'} {getCategoryName(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* No Results Empty State */}
      {filteredRequests.length === 0 && (debouncedSearchQuery || priorityFilter !== 'all' || categoryFilter !== 'all') && (
        <Card className="border-border/40">
          <CardContent className="p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t.maintenance.noResults || 'No se encontraron resultados'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {debouncedSearchQuery
                  ? t.maintenance.noResultsDesc || `No se encontraron solicitudes que coincidan con "${debouncedSearchQuery}"`
                  : t.maintenance.noResultsFilters || 'No se encontraron solicitudes con los filtros seleccionados'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setPriorityFilter('all');
                  setCategoryFilter('all');
                }}
              >
                {t.maintenance.clearFilters || 'Limpiar filtros'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      {filteredRequests.length > 0 && (
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {columns.map((column) => {
            const columnRequests = getRequestsByStatus(column.id);

            return (
              <Card
                key={column.id}
                className={`flex flex-col h-[calc(100vh-20rem)] border ${column.borderColor} transition-all`}
              >
                <CardHeader className={`border-b ${column.borderColor} py-2 px-3 ${column.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded bg-gradient-to-br ${column.gradient}`}>
                        <column.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${column.textColor}`}>
                          {column.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {columnRequests.length} {columnRequests.length === 1 ? t.maintenance.issue : t.maintenance.issues}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
                  <DroppableColumn id={column.id}>
                    {columnRequests.map((request) => (
                      <MaintenanceCard
                        key={request.id}
                        request={request}
                        onClick={() => handleRequestClick(request)}
                        priorityConfig={priorityConfig}
                      />
                    ))}

                    {columnRequests.length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                          <column.icon className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          {t.maintenance.noIssues}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {t.maintenance.dragHere}
                        </p>
                      </div>
                    )}
                  </DroppableColumn>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DragOverlay>
          {activeRequest ? (
            <MaintenanceCard
              request={activeRequest}
              isDragging
              priorityConfig={priorityConfig}
            />
          ) : null}
        </DragOverlay>

        <MaintenanceDetailModal
          request={selectedRequest}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onStatusChange={handleStatusChange}
        />
      </DndContext>
      )}
    </div>
  );
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[150px] transition-colors rounded-md ${
        isOver ? 'bg-primary/5 ring-2 ring-primary/20' : ''
      }`}
    >
      {children}
    </div>
  );
}

interface MaintenanceCardProps {
  request: MaintenanceRequest;
  onClick?: () => void;
  isDragging?: boolean;
  priorityConfig: any;
}

function MaintenanceCard({
  request,
  onClick,
  isDragging = false,
  priorityConfig,
}: MaintenanceCardProps) {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: request.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const priority = priorityConfig[request.priority];
  const categoryIcon = categoryIcons[request.category] || '📋';

  // Generate ticket ID
  const ticketId = `BLOK-${request.id.slice(0, 6).toUpperCase()}`;

  // Translate category name
  const getCategoryName = (category: string) => {
    const translations = t.maintenance.categoryNames as Record<string, string>;
    return translations[category] || category;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (!isDragging && onClick) {
          onClick();
        }
      }}
      className={`group relative mb-1.5 p-2.5 rounded-md border-l-3 ${priority.borderColor} bg-card border border-border/40 cursor-pointer hover:shadow-md hover:scale-[1.01] hover:border-primary/30 transition-all duration-200 ${
        isDragging ? 'opacity-60 rotate-2 scale-105 cursor-grabbing shadow-xl' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-[10px] font-mono text-muted-foreground/60 group-hover:text-primary transition-colors">
            {ticketId}
          </span>
          <Badge
            variant="outline"
            className="text-[9px] px-1 py-0 h-4 font-medium bg-muted/50"
          >
            {categoryIcon} {getCategoryName(request.category)}
          </Badge>
        </div>
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <MoreHorizontal className="w-2.5 h-2.5" />
          </Button>
        </div>
      </div>

      {/* Priority Badge */}
      <div className="flex items-center gap-1 mb-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${priority.dotColor} animate-pulse`} />
        <span className={`text-[10px] font-semibold ${priority.textColor}`}>
          {priority.label}
        </span>
      </div>

      {/* Description */}
      <p className="font-medium text-xs mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
        {request.description}
      </p>

      {/* Photo Preview */}
      {request.has_photos && request.photo_urls && request.photo_urls.length > 0 && (
        <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
          {request.photo_urls.slice(0, 3).map((url, idx) => (
            <a
              key={idx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted hover:ring-2 hover:ring-primary transition-all"
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
            <div className="flex-shrink-0 w-12 h-12 rounded bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground border border-border">
              +{request.photo_urls.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-2">
          {/* Resident */}
          <div className="flex items-center gap-1 text-muted-foreground">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-[8px] font-bold text-white">
              {request.residents.first_name[0]}
              {request.residents.last_name[0]}
            </div>
            <span className="text-[10px] font-medium truncate max-w-[60px]">
              {request.residents.first_name}
            </span>
          </div>

          {/* Unit */}
          {request.units && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <MapPin className="w-2.5 h-2.5" />
              <span className="text-[10px] font-medium">
                {request.units.unit_number}
              </span>
            </div>
          )}

          {/* Photos Badge */}
          {request.has_photos && request.photo_urls && request.photo_urls.length > 0 && (
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <Camera className="w-2.5 h-2.5" />
              <span className="text-[10px] font-medium">{request.photo_urls.length}</span>
            </div>
          )}

          {/* Conversation */}
          {request.conversation_id && (
            <div className="text-muted-foreground">
              <MessageSquare className="w-2.5 h-2.5" />
            </div>
          )}
        </div>

        {/* Time */}
        <div className="flex items-center gap-0.5 text-muted-foreground">
          <Calendar className="w-2.5 h-2.5" />
          <span className="text-[10px]">{formatRelativeTime(request.reported_at)}</span>
        </div>
      </div>
    </div>
  );
}
