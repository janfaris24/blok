import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Pre-built skeleton patterns for common components
function BroadcastSkeleton() {
  return (
    <div className="p-3 rounded-lg border border-border/40">
      <div className="flex items-start justify-between gap-3 mb-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-2/3 mb-3" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="space-y-3 p-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

function ConversationSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-border/40">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  )
}

function MaintenanceCardSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-border/40 bg-card">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-2/3 mb-3" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

function DashboardStatSkeleton() {
  return (
    <div className="p-6 rounded-lg border border-border/40 bg-card">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="w-8 h-8 rounded" />
      </div>
      <Skeleton className="h-8 w-20 mb-1" />
      <Skeleton className="h-3 w-40" />
    </div>
  )
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Table header */}
      <div className="flex gap-4 pb-3 border-b border-border">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  )
}

export {
  Skeleton,
  BroadcastSkeleton,
  CardSkeleton,
  ConversationSkeleton,
  MaintenanceCardSkeleton,
  DashboardStatSkeleton,
  TableSkeleton
}
