// e-commerce/frontend/components/supplier/SupplierNavbar.tsx
"use client";

import { useState } from "react";
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
  Menu,
  X,
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
import { Button } from "@/components/ui/button";

export default function SupplierNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const mobileLinkClass = (path: string) =>
    `w-full px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
      pathname === path
        ? "bg-red-700 text-white shadow-sm"
        : "text-red-200 hover:bg-red-800 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-linear-to-br from-red-900 to-red-950 border-b border-red-800/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT - Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-white rounded-lg flex items-center justify-center">
                <Image src={logo} alt="UrbanYuan" className="w-10 sm:w-14" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-red-50">UrbanYuan</span>
            </Link>
          </div>

          {/* CENTER - Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/supplier/dashboard"
              className={linkClass("/supplier/dashboard")}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/supplier/product"
              className={linkClass("/supplier/product")}
            >
              <Package className="w-4 h-4" />
              <span>Products</span>
            </Link>

            <Link
              href="/supplier/orders"
              className={linkClass("/supplier/orders")}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </Link>
          </div>

          {/* RIGHT - Profile Menu & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {/* Desktop Profile Menu */}
            <div className="hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none">
                    <Avatar className="h-9 w-9 cursor-pointer border-2 border-red-600/50 hover:border-red-500 transition-colors">
                      <AvatarFallback className="bg-red-700 text-white font-semibold text-sm">
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

            {/* Mobile Profile Menu */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none">
                    <Avatar className="h-8 w-8 cursor-pointer border-2 border-red-600/50 hover:border-red-500 transition-colors">
                      <AvatarFallback className="bg-red-700 text-white font-semibold text-xs">
                        S
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-white border-gray-200 shadow-xl"
                >
                  <DropdownMenuLabel className="text-gray-900">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold">Supplier</p>
                      <p className="text-xs text-gray-500">supplier@shophub.com</p>
                    </div>
                  </DropdownMenuLabel>

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

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-red-200 hover:text-white hover:bg-red-800"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-red-800/30">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/supplier/dashboard"
                className={mobileLinkClass("/supplier/dashboard")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/supplier/product"
                className={mobileLinkClass("/supplier/product")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package className="w-5 h-5" />
                <span>Products</span>
              </Link>

              <Link
                href="/supplier/orders"
                className={mobileLinkClass("/supplier/orders")}
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Orders</span>
              </Link>

              {/* Additional mobile menu items */}
              <div className="border-t border-red-800/30 pt-2 mt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                  }}
                  className={mobileLinkClass("/supplier/settings")}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
