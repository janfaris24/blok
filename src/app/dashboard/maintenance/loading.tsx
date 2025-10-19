import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MaintenanceCardSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function MaintenanceLoading() {
  return (
    <div className="pb-24 lg:pb-8">
      <div className="mb-4">
        <Skeleton className="h-8 w-40 mb-1" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Abiertas', 'En Progreso', 'Resueltas', 'Cerradas'].map((status) => (
          <Card key={status} className="flex flex-col h-[calc(100vh-16rem)] border-border/40">
            <CardHeader className="border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardHeader>

            <CardContent className="flex-1 p-3 space-y-2">
              {[1, 2, 3].map((i) => (
                <MaintenanceCardSkeleton key={i} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
