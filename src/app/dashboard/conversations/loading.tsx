import { Card } from '@/components/ui/card';

export default function ConversationsLoading() {
  return (
    <div className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)] animate-pulse">
      <div className="mb-4">
        <div className="h-8 w-48 bg-muted rounded mb-1" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100%-4rem)]">
        {/* Conversations List Skeleton */}
        <Card className="lg:col-span-1 border-border/40">
          <div className="p-4 border-b border-border/40">
            <div className="h-5 w-32 bg-muted rounded" />
          </div>
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/40">
                <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Message Thread Skeleton */}
        <Card className="lg:col-span-2 border-border/40 flex flex-col">
          <div className="p-4 border-b border-border/40">
            <div className="h-5 w-40 bg-muted rounded" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%] space-y-2">
                  <div className={`h-16 w-64 bg-muted rounded-lg ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border/40">
            <div className="h-10 w-full bg-muted rounded" />
          </div>
        </Card>
      </div>
    </div>
  );
}
