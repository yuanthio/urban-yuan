// e-commerce/frontend/components/orders/OrderSummary.tsx
"use client";

import { Package, Truck, CheckCircle, Clock, AlertCircle, Ruler } from "lucide-react";

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

interface OrderSummaryProps {
  order: Order;
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "PAID":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "SHIPPED":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "CANCELLED":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Summary</h2>
      
      {/* Order Status */}
      <div className="mb-6">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          {getStatusText(order.status)}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Order ID: {order.id.slice(0, 8)}...
        </p>
      </div>
      
      {/* Order Items */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-900">Items</h3>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center shrink-0">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <Package className="w-6 h-6 text-gray-400" />
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
      
      {/* Price Breakdown */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
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
        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between text-lg font-semibold text-gray-900">
            <span>Total</span>
            <span>Rp {Math.floor(order.totalPrice * 1.1).toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      {/* Order Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Order Date</span>
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Items</span>
          <span>{order.items.length} items</span>
        </div>
        {order.items.some(item => item.size) && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Contains Sized Items</span>
            <span className="text-blue-600">Yes</span>
          </div>
        )}
      </div>
    </div>
  );
}