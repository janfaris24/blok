import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { RealtimeNotifications } from '@/components/dashboard/real-time-notifications';
import { Toaster } from 'sonner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get admin's building info
  const { data: building } = await supabase
    .from('buildings')
    .select('*')
    .eq('admin_user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        buildingName={building?.name || 'Mi Edificio'}
        userEmail={user.email || ''}
        buildingId={building?.id || ''}
      />
      <main className="lg:pl-64 pt-14 lg:pt-16 pb-16 lg:pb-0">
        <div className="p-4 lg:p-6 max-w-[1800px] mx-auto">
          {children}
        </div>
      </main>
      <RealtimeNotifications buildingId={building?.id || ''} />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
