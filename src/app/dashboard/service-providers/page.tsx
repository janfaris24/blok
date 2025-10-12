import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { ServiceProvidersManager } from '@/components/dashboard/service-providers-manager';

export default async function ServiceProvidersPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Get building for this admin
  const { data: building, error: buildingError } = await supabase
    .from('buildings')
    .select('id, maintenance_model')
    .eq('admin_user_id', user.id)
    .single();

  if (buildingError || !building) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">
          No building associated with this account
        </h1>
      </div>
    );
  }

  // Fetch service providers
  const { data: providers } = await supabase
    .from('service_providers')
    .select('*')
    .eq('building_id', building.id)
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Proveedores de Servicio</h1>
        <p className="text-muted-foreground mt-2">
          Gestiona tu directorio de proveedores confiables para reparaciones y mantenimiento
        </p>
      </div>

      <ServiceProvidersManager
        initialProviders={providers || []}
        maintenanceModel={building.maintenance_model || 'resident_responsibility'}
      />
    </div>
  );
}
