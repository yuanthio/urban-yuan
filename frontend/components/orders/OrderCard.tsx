// e-commerce/frontend/components/orders/OrderCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, Clock, AlertCircle, ChevronRight, Eye, FileText, Ruler } from "lucide-react";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string; // TAMBAH FIELD SIZE
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

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "PAID":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "SHIPPED":
        return <Truck className="w-4 h-4 text-blue-500" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "CANCELLED":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-black text-yellow-400 border-yellow-400";
      case "PAID":
        return "bg-black text-green-400 border-green-400";
      case "SHIPPED":
        return "bg-black text-blue-400 border-blue-400";
      case "COMPLETED":
        return "bg-black text-green-400 border-green-400";
      case "CANCELLED":
        return "bg-black text-red-400 border-red-400";
      default:
        return "bg-black text-gray-400 border-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pending Payment";
      case "PAID":
        return "Payment Confirmed";
      case "SHIPPED":
        return "Shipped";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderTotal = () => {
    const subtotal = order.totalPrice;
    const tax = Math.floor(subtotal * 0.1);
    return (subtotal + tax).toLocaleString();
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </div>
              <span className="text-sm text-gray-600">
                Order #{order.id.slice(0, 8)}...
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Placed on {formatDate(order.createdAt)}
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {order.items.some(item => item.size) && (
                <div className="flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  <Ruler className="w-3 h-3" />
                  <span>Contains sized items</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                Rp {getOrderTotal()}
              </p>
              <p className="text-sm text-gray-600">
                {order.items.length} items
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-6 border-t border-gray-200">
          {/* Order Items */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900">Order Items</h3>
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{item.productName}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-sm text-gray-600">
                      Rp {item.price.toLocaleString()} × {item.quantity}
                    </p>
                    {/* Tampilkan size jika ada */}
                    {item.size && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        <Ruler className="w-3 h-3" />
                        <span>Size: {item.size}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-gray-900 font-semibold">
                  Rp {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rp {order.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>Rp {Math.floor(order.totalPrice * 0.1).toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span>Rp {getOrderTotal()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Order Actions</h3>
              <div className="space-y-2">
                {order.status === "PENDING" && (
                  <Button className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white" asChild>
                    <Link href={`/orders/${order.id}/checkout`}>
                      <Package className="w-4 h-4" />
                      Complete Payment
                    </Link>
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  asChild
                >
                  <Link href={`/orders/${order.id}/confirmation`}>
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4" />
                  Download Invoice
                </Button>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Order Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900">Order Placed</p>
                  <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              
              {order.status === "PAID" || order.status === "SHIPPED" || order.status === "COMPLETED" ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Payment Confirmed</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 opacity-50">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Awaiting Payment</p>
                  </div>
                </div>
              )}
              
              {order.status === "SHIPPED" || order.status === "COMPLETED" ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Shipped</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 opacity-50">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Truck className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Not Yet Shipped</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}