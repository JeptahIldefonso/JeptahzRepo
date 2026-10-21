import { Skeleton } from "@/components/ui/skeleton";

export default function DocDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <Skeleton className="h-4 w-44" />

      <div className="border-b border-border pb-8 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
