// e-commerce/frontend/components/supplier/SupplierNavbar.tsx
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import logo from "../../public/urban-yuan.png";
import {
  ShoppingBag,
  BarChart3,
  Package,
  User,
  LogOut,
  Settings,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function SupplierNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/supplier/login");
  }

  const linkClass = (path: string) =>
    `px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
      pathname === path
        ? "bg-red-700 text-white shadow-sm"
        : "text-red-200 hover:bg-red-800 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-linear-to-br from-red-900 to-red-950 border-b border-red-800/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* LEFT - Brand & Navigation */}
          <div className="flex items-center gap-8">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-4">
              <div className="bg-white rounded-lg flex items-center justify-center">
                <Image src={logo} alt="UrbanYuan" className="w-14" />
              </div>
              <span className="font-bold text-xl text-red-50">UrbanYuan</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              <Link
                href="/supplier/dashboard"
                className={linkClass("/supplier/dashboard")}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>

              <Link
                href="/supplier/product"
                className={linkClass("/supplier/product")}
              >
                <Package className="w-4 h-4" />
                Products
              </Link>

              <Link
                href="/supplier/orders"
                className={linkClass("/supplier/orders")}
              >
                <ShoppingBag className="w-4 h-4" />
                Orders
              </Link>
            </div>
          </div>

          {/* RIGHT - Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <Avatar className="h-10 w-10 cursor-pointer border-2 border-red-600/50 hover:border-red-500 transition-colors">
                  <AvatarFallback className="bg-red-700 text-white font-semibold">
                    S
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 bg-white border-gray-200 shadow-xl"
            >
              <DropdownMenuLabel className="text-gray-900">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">Supplier Account</p>
                  <p className="text-xs text-gray-500">supplier@shophub.com</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-gray-200" />

              <DropdownMenuItem
                onClick={() => router.push("/supplier/dashboard")}
                className="text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => router.push("/supplier/product")}
                className="text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer"
              >
                <Package className="w-4 h-4 mr-2" />
                Products
              </DropdownMenuItem>

              <DropdownMenuItem className="text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-gray-200" />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
