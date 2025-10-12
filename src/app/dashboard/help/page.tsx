import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import { HelpContent } from '@/components/dashboard/help-content';

export default async function HelpPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    redirect('/setup');
  }

  // Check if onboarding is complete
  if (!building.onboarding_completed) {
    redirect('/setup');
  }

  // Get admin language preference
  const { data: admin } = await supabase
    .from('admins')
    .select('language')
    .eq('user_id', user.id)
    .single();

  const language = (admin?.language || 'es') as 'es' | 'en';

  return <HelpContent language={language} />;
}
