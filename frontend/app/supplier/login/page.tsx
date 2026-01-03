// e-commerce/frontend/app/supplier/login/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ShoppingBag } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/urban-yuan.png";

export default function SupplierLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // cek role supplier
      if (data.user?.app_metadata?.role !== "supplier") {
        setError("Bukan akun supplier");
        await supabase.auth.signOut();
        return;
      }

      router.push("/supplier/dashboard");
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-950 via-red-900 to-red-800 flex items-center justify-center px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm"></div>

      <div className="w-full max-w-md flex flex-col justify-center relative z-10">
        {/* Logo/Brand */}
        <div className="flex flex-col text-center items-center gap-2 mb-4">
          <div className="bg-white rounded-sm">
            <Image src={logo} alt="UrbanYuan" className="w-14" />
          </div>
          <h1 className="text-3xl font-bold text-red-50">UrbanYuan</h1>
          <p className="text-red-300 text-sm font-medium">Supplier Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-700/20 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600 text-sm">
                Enter your supplier credentials to access your dashboard
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all duration-200"
                  placeholder="supplier@shophub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-all duration-200 pr-12"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In to Dashboard"}
            </Button>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-red-300 hover:text-red-100 text-sm transition-colors inline-flex items-center gap-2 font-medium"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
