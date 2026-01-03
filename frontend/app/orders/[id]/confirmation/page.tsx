// e-commerce/frontend/app/orders/[id]/confirmation/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SharedNavbar from "@/components/layout/SharedNavbar";
import OrderSummary from "@/components/orders/OrderSummary";
import { CheckCircle, Package, Truck, Home, ShoppingBag, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

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
  supplierId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && id) {
      fetchOrder();
      // Set estimated delivery date (3-5 business days from now)
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 3 + Math.floor(Math.random() * 3));
      setEstimatedDelivery(deliveryDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    }
  }, [user, isLoading, id, router]);

  const fetchOrder = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      
      // Validate order data
      if (!data || !data.id) {
        throw new Error('Invalid order data');
      }
      
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950 flex items-center justify-center">
        <div className="text-red-100">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-100 mb-4">Order not found</h2>
          <button
            onClick={() => router.push('/orders')}
            className="text-red-300 hover:text-red-100"
          >
            View your orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950">
      <SharedNavbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          {/* Success Icon */}
          <div className="w-32 h-32 bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-700/50">
            <CheckCircle className="w-20 h-20 text-green-400" />
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-red-50 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-lg text-red-200 max-w-2xl mx-auto">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 mt-4">
            <p className="text-sm text-red-300">
              Order ID: <span className="font-mono bg-red-800/50 px-2 py-1 rounded">{order.id.slice(0, 8)}...</span>
            </p>
            <span className="hidden sm:inline text-red-400">•</span>
            <p className="text-sm text-red-300">
              Order Date: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-red-50 mb-6 text-center">What's Next?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Processing</h3>
              <p className="text-sm text-gray-600">
                We're preparing your items for shipment. You'll receive an email when your order ships.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Shipping</h3>
              <p className="text-sm text-gray-600">
                Your order will be shipped within 1-2 business days. Tracking information will be emailed to you.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 text-center shadow-xl">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Delivery</h3>
              <p className="text-sm text-gray-600">
                Estimated delivery: <strong>{estimatedDelivery}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Order Details */}
          <div className="lg:col-span-2">
            <OrderSummary order={order} />
          </div>

          {/* Actions & Support */}
          <div className="space-y-6">
            {/* Order Status */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Order Confirmed</p>
                    <p className="text-sm text-gray-600">Your order has been confirmed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Processing</p>
                    <p className="text-sm text-gray-600">Preparing for shipment</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Shipping</p>
                    <p className="text-sm text-gray-600">Will be updated when shipped</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Information */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-6">
                If you have any questions about your order, please contact our customer support.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a 
                    href="mailto:support@shophub.com"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    support@shophub.com
                  </a>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What to do next?</h3>
              <div className="space-y-4">
                <Button className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white" asChild>
                  <Link href="/orders">
                    <Package className="w-4 h-4" />
                    View All Orders
                  </Link>
                </Button>
                
                <Button className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white" asChild>
                  <Link href="/products">
                    <ShoppingBag className="w-4 h-4" />
                    Continue Shopping
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  asChild
                >
                  <Link href="/">
                    <Home className="w-4 h-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}