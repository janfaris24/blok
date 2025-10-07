import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ResidentsLoading() {
  return (
    <div className="pb-24 lg:pb-8 animate-pulse">
      <div className="mb-6">
        <div className="h-8 w-40 bg-muted rounded mb-1" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>

      <Card className="border-border/40">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-10 w-36 bg-muted rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-3 w-32 bg-muted rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-muted rounded" />
                  <div className="h-8 w-8 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
