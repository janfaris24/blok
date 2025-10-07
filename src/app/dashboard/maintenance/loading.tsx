import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function MaintenanceLoading() {
  return (
    <div className="pb-24 lg:pb-8 animate-pulse">
      <div className="mb-4">
        <div className="h-8 w-40 bg-muted rounded mb-1" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Abiertas', 'En Progreso', 'Resueltas', 'Cerradas'].map((status) => (
          <Card key={status} className="flex flex-col h-[calc(100vh-16rem)] border-border/40">
            <CardHeader className="border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-muted rounded-lg" />
                <div className="h-4 w-28 bg-muted rounded" />
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg border border-border/40 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="h-5 w-20 bg-muted rounded-full" />
                    <div className="w-3 h-3 bg-muted rounded" />
                  </div>
                  <div className="h-8 w-full bg-muted rounded" />
                  <div className="space-y-1">
                    <div className="h-3 w-32 bg-muted rounded" />
                    <div className="h-3 w-40 bg-muted rounded" />
                    <div className="h-2 w-24 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
