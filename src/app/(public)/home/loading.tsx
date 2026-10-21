import { Skeleton } from "@/components/ui/skeleton";

export default function HubLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-4 sm:py-8">
      {/* Header Skeleton */}
      <div className="border-b border-border pb-8 space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      {/* Featured App Spotlight Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="border border-border bg-bg-raised p-6 sm:p-8 rounded-[4px] space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-full max-w-md" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="pt-4 border-t border-border flex gap-3">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      </div>

      {/* Recent Records Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between border-b border-border pb-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border bg-bg-raised p-5 sm:p-6 rounded-[4px] space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="pt-2 flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
