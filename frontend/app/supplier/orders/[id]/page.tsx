// e-commerce/frontend/app/supplier/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  ArrowLeft,
  Package,
  User,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer,
  Download,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Trash2,
  Ruler // TAMBAH INI
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string; // TAMBAH FIELD SIZE
  imageUrl?: string;
  product?: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    stock: number;
  };
}

interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

interface Order {
  id: string;
  userId: string;
  supplierId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  user: User;
  items: OrderItem[];
}

export default function SupplierOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/supplier/login");
      return;
    }
    loadOrder();
  };

  const loadOrder = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/supplier/orders/${id}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to load order');

      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
      router.push('/supplier/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/supplier/orders/${order.id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error('Failed to update status');

      toast.success('Order status updated successfully');
      loadOrder();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const deleteOrder = async () => {
    if (!order) return;

    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/supplier/orders/${order.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete order');

      const result = await response.json();
      
      toast.success(`Order deleted successfully. ${result.restoredStock ? 'Product stock has been restored.' : ''}`, {
        duration: 5000,
      });
      
      router.push('/supplier/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
      PENDING: { label: "Pending", variant: "secondary", icon: Clock },
      PAID: { label: "Paid", variant: "default", icon: CreditCard },
      SHIPPED: { label: "Shipped", variant: "default", icon: Truck },
      COMPLETED: { label: "Completed", variant: "default", icon: CheckCircle },
      CANCELLED: { label: "Cancelled", variant: "destructive", icon: AlertCircle },
    };

    const { label, variant, icon: Icon } = variants[status] || { 
      label: status, 
      variant: "outline", 
      icon: Package 
    };

    return (
      <Badge variant={variant} className="gap-2 px-4 py-2">
        <Icon className="w-4 h-4" />
        {label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-950 via-red-900 to-red-800">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <Button asChild>
            <Link href="/supplier/orders">
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-950 via-red-900 to-red-800">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/supplier/orders')}
            className="mb-4 gap-2 text-white hover:bg-red-800/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Order Details</h1>
              <p className="text-red-300 mt-1">View and manage customer order details</p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-red-300">Order #{order.id.slice(0, 8)}...</p>
                {getStatusBadge(order.status)}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Order</DialogTitle>
                    <DialogDescription>
                      Delete this order permanently
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-red-800">Warning: This action cannot be undone</p>
                          <p className="text-sm text-red-700 mt-1">
                            Deleting this order will permanently remove it from the system and restore product stock.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Order ID:</strong> {order.id.slice(0, 8)}...
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Customer:</strong> {order.user.fullName || order.user.email}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Total Amount:</strong> {formatCurrency(order.totalPrice)}
                      </p>
                    </div>
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={deleteOrder}
                      disabled={deleting}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deleting ? 'Deleting...' : 'Delete Order'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="gap-2">
                <Printer className="w-4 h-4" />
                Print
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Invoice
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items ({order.items.length})</CardTitle>
                <CardDescription>Products ordered by customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                        <p className="text-sm text-gray-600">SKU: {item.productId.slice(0, 8)}...</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="text-gray-600">
                            {formatCurrency(item.price)} × {item.quantity}
                          </span>
                          {item.size && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                              <Ruler className="w-3 h-3" />
                              <span>Size: {item.size}</span>
                            </div>
                          )}
                          {item.product && (
                            <Badge variant="outline">
                              Stock: {item.product.stock}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-500">Total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
                <CardDescription>Update order status and manage fulfillment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {order.status === 'PENDING' && (
                    <Button
                      onClick={() => updateOrderStatus('PAID')}
                      disabled={updating}
                      className="gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Mark as Paid
                    </Button>
                  )}
                  
                  {order.status === 'PAID' && (
                    <Button
                      onClick={() => updateOrderStatus('SHIPPED')}
                      disabled={updating}
                      className="gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Mark as Shipped
                    </Button>
                  )}
                  
                  {order.status === 'SHIPPED' && (
                    <Button
                      onClick={() => updateOrderStatus('COMPLETED')}
                      disabled={updating}
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </Button>
                  )}
                  
                  {order.status !== 'CANCELLED' && (
                    <Button
                      variant="destructive"
                      onClick={() => updateOrderStatus('CANCELLED')}
                      disabled={updating}
                      className="gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Cancel Order
                    </Button>
                  )}
                  
                  <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Customer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary & Customer Info */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(order.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">{formatCurrency(order.totalPrice * 0.1)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalPrice * 1.1)}</span>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Order Date</p>
                      <p className="text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Payment Method</p>
                      <p className="text-gray-600">Credit Card</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">Shipping Method</p>
                      <p className="text-gray-600">Standard Delivery (3-5 days)</p>
                    </div>
                  </div>
                  
                  {/* Size Information */}
                  {order.items.some(item => item.size) && (
                    <div className="flex items-center gap-3 text-sm">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="font-medium">Contains Sized Items</p>
                        <p className="text-gray-600">
                          {order.items.filter(item => item.size).length} item(s) with specific sizes
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    {order.user.avatarUrl ? (
                      <AvatarImage 
                        src={order.user.avatarUrl} 
                        alt={order.user.fullName || "Customer"}
                        className="object-cover" 
                      />
                    ) : null}
                    <AvatarFallback className="bg-gray-100">
                      {order.user.fullName ? order.user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : order.user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.user.fullName || 'No Name'}
                    </p>
                    <p className="text-sm text-gray-600">{order.user.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a 
                      href={`mailto:${order.user.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {order.user.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Not provided</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <span className="text-gray-600">
                      123 Main Street, Jakarta, Indonesia 10110
                    </span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full mt-4 gap-2">
                  <Mail className="w-4 h-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}