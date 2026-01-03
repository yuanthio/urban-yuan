// e-commerce/frontend/components/supplier/ProductHeaderSkeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductHeaderSkeleton() {
  return (
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

