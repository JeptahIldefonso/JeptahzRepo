import { Skeleton } from "@/components/ui/skeleton";

export default function HubLoading() {
  return (
    <div className="space-y-12">
      <div className="border-b border-border pb-8 space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-4 w-48" />
        <div className="border border-border bg-bg-raised p-8 rounded-[2px] space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
