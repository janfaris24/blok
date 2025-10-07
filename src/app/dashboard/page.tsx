import { createClient } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageSquare,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react';
import { LaserFlow } from '@/components/ui/laser-flow';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get building
  const { data: building } = await supabase
    .from('buildings')
    .select('*')
    .eq('admin_user_id', user!.id)
    .single();

  if (!building) {
    return <div>No se encontró el edificio</div>;
  }

  // Get stats
  const [
    { count: totalConversations },
    { count: activeConversations },
    { count: totalMaintenanceRequests },
    { count: openRequests },
    { count: inProgressRequests },
    { count: totalResidents },
  ] = await Promise.all([
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', building.id),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', building.id)
      .eq('status', 'active'),
    supabase
      .from('maintenance_requests')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', building.id),
    supabase
      .from('maintenance_requests')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', building.id)
      .eq('status', 'open'),
    supabase
      .from('maintenance_requests')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', building.id)
      .eq('status', 'in_progress'),
    supabase
      .from('residents')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', building.id),
  ]);

  // Get recent conversations
  const { data: recentConversations } = await supabase
    .from('conversations')
    .select(`
      *,
      residents (
        first_name,
        last_name,
        phone
      )
    `)
    .eq('building_id', building.id)
    .order('last_message_at', { ascending: false })
    .limit(5);

  // Get recent maintenance requests
  const { data: recentRequests } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      residents (
        first_name,
        last_name
      )
    `)
    .eq('building_id', building.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    {
      title: 'Conversaciones Activas',
      value: activeConversations || 0,
      total: totalConversations || 0,
      icon: MessageSquare,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Solicitudes Abiertas',
      value: openRequests || 0,
      total: totalMaintenanceRequests || 0,
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      title: 'En Progreso',
      value: inProgressRequests || 0,
      total: totalMaintenanceRequests || 0,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      title: 'Total Residentes',
      value: totalResidents || 0,
      total: null,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header with LaserFlow Background */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-gradient-to-br from-background via-background to-muted/20 p-6">
        <div className="absolute inset-0 opacity-30">
          <LaserFlow
            color="#3b82f6"
            horizontalBeamOffset={0.0}
            verticalBeamOffset={0.3}
            flowSpeed={0.3}
            wispDensity={0.8}
            fogIntensity={0.3}
            verticalSizing={3.0}
          />
        </div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Resumen General</h1>
          <p className="text-sm text-muted-foreground">
            {building.name}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden border-border/40 relative group hover:border-primary/50 transition-all">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity">
              <LaserFlow
                color={stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('red') ? '#ef4444' : stat.color.includes('yellow') ? '#eab308' : '#22c55e'}
                horizontalBeamOffset={0.5}
                verticalBeamOffset={0.5}
                flowSpeed={0.5}
                wispDensity={1.2}
                fogIntensity={0.4}
                verticalSizing={1.5}
              />
            </div>
            <CardHeader className="pb-3 relative z-10">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">
                  {stat.title}
                </CardDescription>
                <div className={`p-2.5 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{stat.value}</p>
                {stat.total !== null && (
                  <p className="text-base text-muted-foreground">/ {stat.total}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Conversations */}
        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="w-4 h-4" />
              Conversaciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentConversations && recentConversations.length > 0 ? (
              recentConversations.map((conv: any) => (
                <div
                  key={conv.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {conv.residents?.first_name} {conv.residents?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conv.status === 'active' ? 'Activa' : 'Cerrada'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-6 text-sm">
                No hay conversaciones todavía
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Maintenance Requests */}
        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="w-4 h-4" />
              Solicitudes Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentRequests && recentRequests.length > 0 ? (
              recentRequests.map((request: any) => {
                const statusConfig = {
                  open: { label: 'Abierta', color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
                  in_progress: { label: 'En Progreso', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
                  resolved: { label: 'Resuelta', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
                  closed: { label: 'Cerrada', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
                };

                const status = statusConfig[request.status as keyof typeof statusConfig];

                return (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{request.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {request.priority === 'emergency' && '🚨 '}
                          {request.priority === 'high' && '⚠️ '}
                          {request.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-6 text-sm">
                No hay solicitudes todavía
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
