import { createClient } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageSquare,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle
} from 'lucide-react';

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
      change: '+15.8%',
      trend: 'up' as const,
      icon: Activity,
      description: `${totalConversations || 0} total`,
    },
    {
      title: 'Total Residentes',
      value: totalResidents || 0,
      change: '+8.3%',
      trend: 'up' as const,
      icon: Users,
      description: 'Owners & renters',
    },
    {
      title: 'Solicitudes Abiertas',
      value: openRequests || 0,
      change: '-12.4%',
      trend: 'down' as const,
      icon: AlertCircle,
      description: `${totalMaintenanceRequests || 0} total`,
    },
    {
      title: 'En Progreso',
      value: inProgressRequests || 0,
      change: '+24.2%',
      trend: 'up' as const,
      icon: Clock,
      description: 'Maintenance tasks',
    },
  ];

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-0.5">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen general de {building.name}
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
          <HelpCircle className="w-3.5 h-3.5" />
          Ayuda
        </button>
      </div>

      {/* Stats Grid - Nexus Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/40 hover:shadow-md hover:shadow-primary/5 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/40" />
              </div>
              <CardDescription className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold tracking-tight">{stat.value.toLocaleString()}</p>
                <div className={`flex items-center gap-0.5 text-xs font-semibold ${
                  stat.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Conversations */}
        <Card className="border-border/40">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Conversaciones Recientes</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-0">
            {recentConversations && recentConversations.length > 0 ? (
              recentConversations.map((conv: any, idx: number) => (
                <div
                  key={conv.id}
                  className={`flex items-center gap-3 py-3 hover:bg-muted/50 -mx-6 px-6 transition-colors cursor-pointer ${
                    idx !== recentConversations.length - 1 ? 'border-b border-border/40' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {conv.residents?.first_name} {conv.residents?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {conv.status === 'active' ? 'Activa' : 'Cerrada'}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    conv.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8 text-xs">
                No hay conversaciones todavía
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Maintenance Requests */}
        <Card className="border-border/40">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold">Solicitudes de Mantenimiento</CardTitle>
            <Wrench className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-0">
            {recentRequests && recentRequests.length > 0 ? (
              recentRequests.map((request: any, idx: number) => {
                const statusConfig = {
                  open: { label: 'Abierta', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30' },
                  in_progress: { label: 'En Progreso', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30' },
                  resolved: { label: 'Resuelta', color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/30' },
                  closed: { label: 'Cerrada', color: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800' },
                };

                const status = statusConfig[request.status as keyof typeof statusConfig];

                return (
                  <div
                    key={request.id}
                    className={`flex items-center gap-3 py-3 hover:bg-muted/50 -mx-6 px-6 transition-colors cursor-pointer ${
                      idx !== recentRequests.length - 1 ? 'border-b border-border/40' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
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
                    {request.priority === 'emergency' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground text-center py-8 text-xs">
                No hay solicitudes todavía
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
