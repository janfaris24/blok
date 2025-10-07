import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function BuildingLoading() {
  return (
    <div className="pb-24 lg:pb-8 animate-pulse">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="h-8 w-32 bg-muted rounded mb-1" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>

        {/* Building Info Skeleton */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <div className="h-5 w-48 bg-muted rounded" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/40">
              <CardHeader className="pb-3">
                <div className="h-4 w-32 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-10 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions Skeleton */}
        <div className="flex gap-3">
          <div className="h-10 w-48 bg-muted rounded" />
        </div>

        {/* Units Skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-40 bg-muted rounded" />
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <div className="h-4 w-24 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-20 bg-muted rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
