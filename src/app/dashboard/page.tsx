import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MessageSquare,
  Wrench,
  AlertCircle,
  Clock,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle
} from 'lucide-react';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  // Get building
  const { data: building } = await supabase
    .from('buildings')
    .select('*')
    .eq('admin_user_id', user.id)
    .single();

  if (!building) {
    return <div>No se encontró el edificio</div>;
  }

  // Check if onboarding is complete
  if (!building.onboarding_completed) {
    redirect('/setup');
  }

  // Get stats
  const [
    { count: totalConversations },
    { count: activeConversations },
    { count: totalMaintenanceRequests },
    { count: openRequests },
    { count: inProgressRequests },
    { count: totalResidents },
    { count: pendingPayments },
    { count: latePayments },
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
    supabase
      .from('maintenance_fees')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', building.id)
      .eq('status', 'pending'),
    supabase
      .from('maintenance_fees')
      .select('*', { count: 'exact', head: true })
      .eq('building_id', building.id)
      .eq('status', 'late'),
  ]);

  // Get pending/late payment amounts
  const { data: pendingFees } = await supabase
    .from('maintenance_fees')
    .select('total_amount')
    .eq('building_id', building.id)
    .in('status', ['pending', 'late']);

  const totalPendingAmount = pendingFees?.reduce((sum, fee) => sum + parseFloat(fee.total_amount || '0'), 0) || 0;

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

  const stats = {
    activeConversations: activeConversations || 0,
    totalConversations: totalConversations || 0,
    totalResidents: totalResidents || 0,
    openRequests: openRequests || 0,
    totalMaintenanceRequests: totalMaintenanceRequests || 0,
    inProgressRequests: inProgressRequests || 0,
    pendingPayments: pendingPayments || 0,
    latePayments: latePayments || 0,
    totalPendingAmount: totalPendingAmount,
  };

  return (
    <DashboardClient
      buildingName={building.name}
      stats={stats}
      recentConversations={recentConversations || []}
      recentRequests={recentRequests || []}
    />
  );
}
