import { createClient } from '@/lib/supabase-server';
import { BuildingManager } from '@/components/dashboard/building-manager';

export const dynamic = 'force-dynamic';

export default async function BuildingPage() {
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

  // Get all units
  const { data: units } = await supabase
    .from('units')
    .select(`
      *,
      owner:residents!units_owner_id_fkey(first_name, last_name),
      renter:residents!units_current_renter_id_fkey(first_name, last_name)
    `)
    .eq('building_id', building.id)
    .order('floor', { ascending: true })
    .order('unit_number', { ascending: true });

  return (
    <div className="pb-24 lg:pb-8">
      <BuildingManager
        building={building}
        initialUnits={units || []}
      />
    </div>
  );
}
