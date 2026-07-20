import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-1">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="h-11 w-11 rounded-lg" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-28" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="mb-4 h-5 w-36" />
            <Skeleton className="h-56 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
