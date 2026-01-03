// e-commerce/frontend/app/cart/page.tsx 
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cart from "@/components/user/Cart";
import { useAuth } from "@/contexts/AuthContext";

export default function CartPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950 flex items-center justify-center">
        <div className="text-red-100">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return <Cart />;
}
