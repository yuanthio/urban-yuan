// e-commerce/frontend/app/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SharedNavbar from "@/components/layout/SharedNavbar";
import OrderCard from "@/components/orders/OrderCard";
import { Package, ShoppingBag, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, isLoading, getUserOrders } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadOrders();
    }
  }, [user, isLoading, router]);

  const loadOrders = async () => {
    try {
      const userOrders = await getUserOrders();
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950 flex items-center justify-center">
        <div className="text-red-100">Loading orders...</div>
      </div>
    );
  }

  const getStatusCount = (status: string) => {
    return orders.filter(order => order.status === status).length;
  };

  const getFilteredOrders = () => {
    switch (activeFilter) {
      case 'pending':
        return orders.filter(order => order.status === "PENDING");
      case 'paid':
        return orders.filter(order => order.status === "PAID");
      case 'shipped':
        return orders.filter(order => order.status === "SHIPPED");
      case 'completed':
        return orders.filter(order => order.status === "COMPLETED");
      case 'cancelled':
        return orders.filter(order => order.status === "CANCELLED");
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950">
      <SharedNavbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-800 text-red-100 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <Package className="w-4 h-4" />
            My Orders
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-red-50 mb-6">
            Order <span className="text-red-400">History</span>
          </h1>
          <p className="text-lg text-red-200 max-w-2xl mx-auto mb-8">
            Track and manage all your orders in one place
          </p>
        </div>

        {/* Order Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-xl">
            <div className="text-2xl font-bold text-gray-900 mb-1">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-xl">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{getStatusCount("PENDING")}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-xl">
            <div className="text-2xl font-bold text-green-600 mb-1">{getStatusCount("PAID")}</div>
            <div className="text-sm text-gray-600">Paid</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-xl">
            <div className="text-2xl font-bold text-blue-600 mb-1">{getStatusCount("SHIPPED")}</div>
            <div className="text-sm text-gray-600">Shipped</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-xl">
            <div className="text-2xl font-bold text-green-600 mb-1">{getStatusCount("COMPLETED")}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-xl">
            <div className="text-2xl font-bold text-red-600 mb-1">{getStatusCount("CANCELLED")}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Order Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'all' 
                ? 'bg-red-700 text-white' 
                : 'bg-red-800/50 text-red-200 hover:bg-red-700/50'
            }`}
          >
            All Orders
          </button>
          <button 
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'pending' 
                ? 'bg-red-700 text-white' 
                : 'bg-red-800/50 text-red-200 hover:bg-red-700/50'
            }`}
          >
            Pending
          </button>
          <button 
            onClick={() => setActiveFilter('paid')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'paid' 
                ? 'bg-red-700 text-white' 
                : 'bg-red-800/50 text-red-200 hover:bg-red-700/50'
            }`}
          >
            Paid
          </button>
          <button 
            onClick={() => setActiveFilter('shipped')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'shipped' 
                ? 'bg-red-700 text-white' 
                : 'bg-red-800/50 text-red-200 hover:bg-red-700/50'
            }`}
          >
            Shipped
          </button>
          <button 
            onClick={() => setActiveFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'completed' 
                ? 'bg-red-700 text-white' 
                : 'bg-red-800/50 text-red-200 hover:bg-red-700/50'
            }`}
          >
            Completed
          </button>
          <button 
            onClick={() => setActiveFilter('cancelled')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'cancelled' 
                ? 'bg-red-700 text-white' 
                : 'bg-red-800/50 text-red-200 hover:bg-red-700/50'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeFilter === 'all' ? 'No orders yet' : `No ${activeFilter} orders`}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeFilter === 'all' 
                ? "You haven't placed any orders yet. Start shopping to see your orders here."
                : `You don't have any ${activeFilter} orders.`
              }
            </p>
            {activeFilter === 'all' && (
              <Button 
                className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                asChild
              >
                <Link href="/products">
                  <ShoppingBag className="w-4 h-4" />
                  Start Shopping
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}