import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 pb-24 lg:pb-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="relative overflow-hidden rounded-xl border border-border/40 bg-muted/20 p-6">
        <div className="h-8 w-48 bg-muted rounded mb-2" />
        <div className="h-4 w-32 bg-muted rounded" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="w-9 h-9 bg-muted rounded-lg" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-10 w-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="border-border/40">
            <CardHeader className="pb-4">
              <div className="h-5 w-40 bg-muted rounded" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
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
