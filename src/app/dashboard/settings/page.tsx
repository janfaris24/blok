import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { SettingsManager } from '@/components/dashboard/settings-manager';
import { getUsageStats } from '@/lib/usage-tracking';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  // Get usage stats if subscription is active
  let usageStats = null;
  if (building.stripe_subscription_id && building.subscription_status) {
    try {
      usageStats = await getUsageStats(building.id, {
        stripe_subscription_id: building.stripe_subscription_id,
        stripe_price_id: building.stripe_price_id,
        subscription_status: building.subscription_status,
        current_period_end: building.current_period_end,
        cancel_at_period_end: building.cancel_at_period_end,
      });
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
      // Continue without usage stats
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona las preferencias de tu cuenta y del edificio
        </p>
      </div>

      <SettingsManager
        building={building}
        userEmail={user.email || ''}
        userName={user.user_metadata?.full_name || ''}
        usageStats={usageStats}
      />
    </div>
  );
}
