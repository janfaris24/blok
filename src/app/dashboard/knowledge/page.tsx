import { createClient } from '@/lib/supabase-server';
import { KnowledgeBaseManager } from '@/components/dashboard/knowledge-base-manager';

export const dynamic = 'force-dynamic';

export default async function KnowledgePage() {
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

  // Get knowledge base entries
  const { data: entries } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('building_id', building.id)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <div>
        <h1 className="text-2xl font-bold mb-0.5">Base de Conocimiento</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona las respuestas del AI a preguntas comunes de los residentes
        </p>
      </div>

      <KnowledgeBaseManager
        initialEntries={entries || []}
        buildingId={building.id}
      />
    </div>
  );
}
