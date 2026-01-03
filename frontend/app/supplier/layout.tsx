// e-commerce/frontend/app/supplier/layout.tsx
"use client";

import SupplierNavbar from "@/components/supplier/SupplierNavbar";
import { usePathname } from "next/navigation";

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/supplier/login";

  return (
    <div>
      {!isLoginPage && <SupplierNavbar />}
      <main>{children}</main>
    </div>
  );
}
