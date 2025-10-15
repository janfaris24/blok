import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { DashboardMainWrapper } from '@/components/dashboard/dashboard-main-wrapper';
import { RealtimeNotifications } from '@/components/dashboard/real-time-notifications';
import { SupportChatWidget } from '@/components/dashboard/support-chat-widget';
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/contexts/language-context';
import { Language } from '@/lib/translations';

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

  const language = (building?.preferred_language || 'es') as Language;

  return (
    <LanguageProvider language={language}>
      <div className="min-h-screen bg-background">
        <DashboardNav
          buildingName={building?.name || 'Mi Edificio'}
          userEmail={user.email || ''}
          userName={user.user_metadata?.full_name || ''}
          buildingId={building?.id || ''}
        />
        <DashboardMainWrapper>
          {children}
        </DashboardMainWrapper>
        <RealtimeNotifications buildingId={building?.id || ''} />
        <SupportChatWidget language={language} />
        <Toaster position="top-right" richColors closeButton />
      </div>
    </LanguageProvider>
  );
}
