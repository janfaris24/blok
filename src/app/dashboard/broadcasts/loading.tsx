import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function BroadcastsLoading() {
  return (
    <div className="space-y-6 pb-24 lg:pb-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-muted rounded mb-1" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-10 w-36 bg-muted rounded" />
      </div>

      {/* Coming Soon Notice Skeleton */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <div className="h-5 w-48 bg-muted rounded" />
          <div className="h-4 w-full max-w-md bg-muted rounded mt-1" />
        </CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-5 w-48 bg-muted rounded" />
          ))}
        </CardContent>
      </Card>

      {/* Recent Broadcasts Skeleton */}
      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <div className="h-5 w-40 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 rounded-lg border border-border/40 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-5 w-20 bg-muted rounded-full" />
              </div>
              <div className="h-8 w-full bg-muted rounded" />
              <div className="flex items-center gap-2">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
