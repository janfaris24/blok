import { Card } from '@/components/ui/card';
import { ConversationSkeleton, Skeleton } from '@/components/ui/skeleton';

export default function ConversationsLoading() {
  return (
    <div className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)]">
      <div className="mb-4">
        <Skeleton className="h-8 w-48 mb-1" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100%-4rem)]">
        {/* Conversations List Skeleton */}
        <Card className="lg:col-span-1 border-border/40">
          <div className="p-4 border-b border-border/40">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        </Card>

        {/* Message Thread Skeleton */}
        <Card className="lg:col-span-2 border-border/40 flex flex-col">
          <div className="p-4 border-b border-border/40">
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%] space-y-2">
                  <Skeleton className={`h-16 w-64 ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border/40">
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}
