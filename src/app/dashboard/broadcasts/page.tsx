import { createClient } from '@/lib/supabase-server';
import { BroadcastComposer } from '@/components/dashboard/broadcast-composer';
import { BroadcastsList } from '@/components/dashboard/broadcasts-list';

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

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-1">Anuncios</h1>
        <p className="text-sm text-muted-foreground">
          Envía mensajes masivos a tus residentes
        </p>
      </div>

      {/* Broadcast Composer */}
      <BroadcastComposer
        buildingId={building.id}
        units={units || []}
      />

      {/* Recent Broadcasts */}
      <BroadcastsList initialBroadcasts={broadcasts || []} buildingId={building.id} />
    </div>
  );
}
