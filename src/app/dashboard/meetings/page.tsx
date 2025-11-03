import { createClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { AsambleasManager } from '@/components/dashboard/asambleas-manager';

export const metadata = {
  title: 'Meetings | Blok',
  description: 'Manage condominium meetings',
};

export default async function MeetingsPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  // Get building
  const { data: building } = await supabase
    .from('buildings')
    .select('id, name')
    .eq('admin_user_id', user.id)
    .single();

  if (!building) {
    redirect('/auth');
  }

  // Fetch all asambleas
  const { data: asambleas } = await supabase
    .from('asambleas')
    .select('*')
    .eq('building_id', building.id)
    .order('meeting_date', { ascending: false });

  return (
    <div className="container mx-auto p-4 md:p-6">
      <AsambleasManager
        initialAsambleas={asambleas || []}
        buildingId={building.id}
      />
    </div>
  );
}
