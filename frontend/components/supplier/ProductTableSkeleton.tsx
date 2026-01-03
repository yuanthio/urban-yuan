// e-commerce/frontend/components/supplier/ProductTableSkeleton.tsx
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">No</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            {/* NO */}
            <TableCell>
              <Skeleton className="h-4 w-6" />
            </TableCell>

            {/* IMAGE */}
            <TableCell>
              <Skeleton className="h-12 w-12 rounded" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-32" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-16" />
            </TableCell>

            <TableCell className="text-right space-x-2">
              <Skeleton className="inline-block h-8 w-16" />
              <Skeleton className="inline-block h-8 w-16" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}




