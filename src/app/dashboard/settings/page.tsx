import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { SettingsManager } from '@/components/dashboard/settings-manager';

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
      />
    </div>
  );
}
