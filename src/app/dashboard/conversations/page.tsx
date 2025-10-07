import { createClient } from '@/lib/supabase-server';
import { ConversationsList } from '@/components/dashboard/conversations-list';

export const dynamic = 'force-dynamic';

export default async function ConversationsPage() {
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

  // Get all conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      residents (
        id,
        first_name,
        last_name,
        phone,
        whatsapp_number,
        type,
        preferred_language
      )
    `)
    .eq('building_id', building.id)
    .order('last_message_at', { ascending: false });

  return (
    <div className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mb-1">Conversaciones</h1>
        <p className="text-sm text-muted-foreground">
          Chatea con tus residentes en tiempo real
        </p>
      </div>

      <ConversationsList
        initialConversations={conversations || []}
        buildingId={building.id}
      />
    </div>
  );
}
