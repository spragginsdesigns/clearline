import { Skeleton } from "@/components/skeleton";

/** Shown while a result loads after "Check": the shape of the result card, no spinner. */
export default function ResultLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-6" role="status" aria-label="Loading result">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-6 rounded-2xl border border-line bg-panel p-6">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-12 w-48" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-2/3" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>
    </div>
  );
}
