import { createClient } from '@/lib/supabase-server';
import { ResidentsManager } from '@/components/dashboard/residents-manager';

export const dynamic = 'force-dynamic';

export default async function ResidentsPage() {
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

  // Get all residents
  const { data: residents } = await supabase
    .from('residents')
    .select('*')
    .eq('building_id', building.id)
    .order('created_at', { ascending: false });

  // Get all units
  const { data: units } = await supabase
    .from('units')
    .select('*')
    .eq('building_id', building.id)
    .order('unit_number', { ascending: true });

  return (
    <div className="pb-24 lg:pb-8">
      <ResidentsManager
        initialResidents={residents || []}
        units={units || []}
        buildingId={building.id}
      />
    </div>
  );
}
