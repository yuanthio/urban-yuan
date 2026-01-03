// e-commerce/frontend/app/supplier/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { fetchSupplierStats } from "@/lib/api/supplier";
import DashboardSkeleton from "@/components/supplier/DashboardSkeleton";
import { TrendingUp, Package, DollarSign, BarChart3, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupplierDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/supplier/login");
        return;
      }

      try {
        const data = await fetchSupplierStats(session.access_token);
        setStats(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-950 via-red-900 to-red-800">
      {/* Header */}
      <div className="border-b border-red-700/30 bg-red-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-red-50">Supplier Dashboard</h1>
            <p className="text-red-300 mt-1">Manage your products and track performance</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ModernStatCard 
            title="Total Products" 
            value={stats.totalProducts} 
            icon={Package}
            trend="+12%"
            trendUp={true}
          />
          <ModernStatCard 
            title="Total Stock" 
            value={stats.totalStock} 
            icon={BarChart3}
            trend="+5%"
            trendUp={true}
          />
          <ModernStatCard 
            title="Inventory Value" 
            value={`Rp ${stats.inventoryValue.toLocaleString()}`} 
            icon={DollarSign}
            trend="+18%"
            trendUp={true}
          />
          <ModernStatCard 
            title="Low Stock Items" 
            value="12" 
            icon={TrendingUp}
            trend="-3%"
            trendUp={false}
          />
        </div>

        {/* Latest Products */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Latest Products</h2>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {stats.latestProducts.map((p: any) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      className="h-16 w-16 rounded-lg object-cover shadow-sm"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{p.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Stock: <span className={`font-medium ${p.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                        {p.stock}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-xl text-gray-900">Rp {p.price.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mt-1">Per unit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModernStatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend: string; 
  trendUp: boolean; 
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-red-600" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          trendUp ? 'text-green-600' : 'text-red-600'
        }`}>
          {trendUp ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingUp className="w-4 h-4 rotate-180" />
          )}
          {trend}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold mt-2 text-gray-900">{value}</p>
    </div>
  );
}
