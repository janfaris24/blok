import { createClient } from '@/lib/supabase-server';
import { MaintenanceBoard } from '@/components/dashboard/maintenance-board';

export const dynamic = 'force-dynamic';

export default async function MaintenancePage() {
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

  // Get all maintenance requests
  const { data: requests } = await supabase
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
      conversations (
        id
      )
    `)
    .eq('building_id', building.id)
    .order('reported_at', { ascending: false });

  return (
    <div className="pb-24 lg:pb-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">Mantenimiento</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona solicitudes de mantenimiento
        </p>
      </div>

      <MaintenanceBoard
        initialRequests={requests || []}
        buildingId={building.id}
      />
    </div>
  );
}
