import { createClient } from '@/lib/supabase-server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, Users, Home, Key, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function BroadcastsPage() {
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

  // Get broadcasts
  const { data: broadcasts } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('building_id', building.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Anuncios</h1>
          <p className="text-sm text-muted-foreground">
            Envía mensajes masivos a tus residentes
          </p>
        </div>
        <Button className="gap-2">
          <Megaphone className="w-4 h-4" />
          Nuevo Anuncio
        </Button>
      </div>

      {/* Coming Soon Notice */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
            Función en Desarrollo
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            La funcionalidad de anuncios masivos estará disponible próximamente. Podrás enviar mensajes a:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Todos los residentes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Solo dueños</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Key className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Solo inquilinos</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-medium">Programar envíos</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent Broadcasts */}
      {broadcasts && broadcasts.length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Anuncios Anteriores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {broadcasts.map((broadcast: any) => (
              <div
                key={broadcast.id}
                className="p-3 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-medium text-sm">{broadcast.subject}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                    broadcast.status === 'sent'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : broadcast.status === 'sending'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {broadcast.status === 'sent' ? 'Enviado' : broadcast.status === 'sending' ? 'Enviando' : 'Borrador'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {broadcast.message}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(broadcast.created_at)}</span>
                  <span>•</span>
                  <span>
                    {broadcast.target_audience === 'all' ? 'Todos' :
                     broadcast.target_audience === 'owners' ? 'Dueños' : 'Inquilinos'}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
