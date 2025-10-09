import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';

export default async function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Must be authenticated
  if (!user) {
    redirect('/login');
  }

  // Get building to check if already completed
  const { data: building } = await supabase
    .from('buildings')
    .select('onboarding_completed')
    .eq('admin_user_id', user.id)
    .single();

  // If onboarding already completed, redirect to main dashboard
  if (building?.onboarding_completed) {
    redirect('/dashboard');
  }

  // Return clean layout without dashboard nav
  return <>{children}</>;
}
