// e-commerce/frontend/components/supplier/DashboardSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8">
      {/* TITLE */}
      <Skeleton className="h-8 w-48" />

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-xl p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>

      {/* LATEST PRODUCTS */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />

        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between border rounded-lg p-4"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
