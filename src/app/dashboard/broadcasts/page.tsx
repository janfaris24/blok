import { createClient } from '@/lib/supabase-server';
import { BroadcastComposer } from '@/components/dashboard/broadcast-composer';
import { BroadcastsList } from '@/components/dashboard/broadcasts-list';
import { BroadcastUsageCard } from '@/components/dashboard/broadcast-usage-card';
import { getSubscription } from '@/lib/subscription-server';
import { checkFeatureAccess } from '@/lib/subscription';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { getBroadcastCount } from '@/lib/usage-tracking';

export const dynamic = 'force-dynamic';

export default async function BroadcastsPage() {
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

  // Check subscription access for broadcasts
  const subscription = await getSubscription();
  const broadcastAccess = subscription
    ? checkFeatureAccess(subscription, 'broadcasts')
    : { hasAccess: false, currentPlan: null, requiredPlan: 'PROFESSIONAL' as const, reason: 'No subscription' };

  // Get all units for specific unit selection
  const { data: units } = await supabase
    .from('units')
    .select('id, unit_number')
    .eq('building_id', building.id)
    .order('unit_number', { ascending: true });

  // Get broadcasts
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('building_id', building.id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Get broadcast count for current month
  const broadcastCount = broadcastAccess.hasAccess ? await getBroadcastCount(building.id) : 0;

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Anuncios</h1>
        <p className="text-sm text-muted-foreground">
          Envía mensajes masivos a tus residentes
        </p>
      </div>

      {/* Feature Gate: Check if user has access to broadcasts */}
      {!broadcastAccess.hasAccess ? (
        <UpgradePrompt
          currentPlan={broadcastAccess.currentPlan}
          requiredPlan={broadcastAccess.requiredPlan!}
          feature="Anuncios"
          description="Envía mensajes masivos a todos tus residentes, propietarios, o inquilinos con el plan Professional."
        />
      ) : (
        <>
          {/* Broadcast Usage Stats */}
          <BroadcastUsageCard count={broadcastCount} limit={null} />

          {/* Broadcast Composer */}
          <BroadcastComposer
            buildingId={building.id}
            units={units || []}
          />

          {/* Recent Broadcasts */}
          <BroadcastsList initialBroadcasts={broadcasts || []} buildingId={building.id} />
        </>
      )}
    </div>
  );
}
