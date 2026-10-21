import { Skeleton } from "@/components/ui/skeleton";

export default function AppDetailLoading() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Skeleton className="h-4 w-40" />

      <div className="border-b border-border pb-6 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <Skeleton className="aspect-video w-full rounded-[2px]" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="space-y-4 border-l border-border pl-6">
          <Skeleton className="h-4 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
