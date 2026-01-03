// e-commerce/frontend/app/payment/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SharedNavbar from "@/components/layout/SharedNavbar";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Home, 
  ShoppingBag,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const dynamic = 'force-dynamic';

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'success' | 'pending' | 'error' | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);

  useEffect(() => {
    const order_id = searchParams.get('order_id') || 
                    searchParams.get('orderId') || 
                    localStorage.getItem('last_order_id');
    
    const transaction_status = searchParams.get('transaction_status');
    const status_code = searchParams.get('status_code');

    console.log('Payment callback params:', {
      order_id,
      transaction_status,
      status_code,
      allParams: Object.fromEntries(searchParams.entries())
    });

    setOrderId(order_id);

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      setStatus('success');
    } else if (transaction_status === 'pending') {
      setStatus('pending');
    } else if (transaction_status === 'deny' || transaction_status === 'expire' || transaction_status === 'cancel') {
      setStatus('error');
    }

    // If we have order_id, verify with backend
    if (order_id) {
      verifyPayment(order_id);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (orderId: string) => {
    try {
      const token = await getAccessToken();
      if (!token) {
        console.log('No access token found');
        setLoading(false);
        return;
      }

      console.log(`Verifying payment for order: ${orderId}`);

      // Check transaction status from backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/${orderId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Transaction status from backend:', data);
        
        setTransactionData(data);

        if (data.transaction_status === 'settlement' || data.transaction_status === 'capture') {
          setStatus('success');
          toast.success('Payment successful!');
        } else if (data.transaction_status === 'pending') {
          setStatus('pending');
          toast.info('Payment is being processed');
        } else {
          setStatus('error');
          toast.error('Payment failed');
        }

        // Jika status lokal berbeda dengan Midtrans, sync
        if (data.status_changed) {
          console.log(`Status changed from ${data.local_status} to ${data.updated_status}`);
          toast.info(`Order status updated to ${data.updated_status}`);
        }
      } else {
        console.error('Failed to verify payment:', await response.text());
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncWithMidtrans = async () => {
    if (!orderId) return;
    
    setSyncing(true);
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/${orderId}/status`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTransactionData(data);
        toast.success('Status synced with Midtrans');
        
        // Refresh page setelah sync
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error('Error syncing:', error);
      toast.error('Failed to sync status');
    } finally {
      setSyncing(false);
    }
  };

  // HAPUS FUNGSI manualUpdateStatus
  // const manualUpdateStatus = async (newStatus: string) => {
  //   if (!orderId) return;
    
  //   try {
  //     const token = await getAccessToken();
  //     if (!token) return;

  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_URL}/payment/${orderId}/manual-update`,
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ status: newStatus }),
  //       }
  //     );

  //     if (response.ok) {
  //       toast.success(`Order status updated to ${newStatus}`);
  //       setTimeout(() => {
  //         window.location.reload();
  //       }, 1000);
  //     }
  //   } catch (error) {
  //     console.error('Error updating status:', error);
  //     toast.error('Failed to update status');
  //   }
  // };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950">
        <SharedNavbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
                <div className="w-2 h-2 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '300ms' }} />
              </div>
              <p className="text-red-200 text-lg">Verifying payment...</p>
              <p className="text-red-300 text-sm mt-2">
                Order ID: {orderId?.slice(0, 8)}...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950">
      <SharedNavbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Sync Button */}
          <div className="flex justify-end mb-6">
            <Button
              variant="outline"
              onClick={syncWithMidtrans}
              disabled={syncing || !orderId}
              className="gap-2 border-red-400 text-red-500 hover:bg-red-800 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync with Midtrans'}
            </Button>
          </div>

          {/* Transaction Info */}
          {transactionData && (
            <div className="bg-red-800/30 backdrop-blur-sm border border-red-700/50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-red-100 mb-4">Transaction Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-red-300 text-sm">Order ID</p>
                  <p className="text-red-100 font-mono">{transactionData.order_id}</p>
                </div>
                <div>
                  <p className="text-red-300 text-sm">Midtrans Status</p>
                  <p className={`font-semibold ${
                    transactionData.transaction_status === 'settlement' || transactionData.transaction_status === 'capture' 
                      ? 'text-green-400' 
                      : transactionData.transaction_status === 'pending'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}>
                    {transactionData.transaction_status?.toUpperCase() || 'UNKNOWN'}
                  </p>
                </div>
                <div>
                  <p className="text-red-300 text-sm">Local Status</p>
                  <p className="text-red-100">{transactionData.local_status}</p>
                </div>
                <div>
                  <p className="text-red-300 text-sm">Amount</p>
                  <p className="text-red-100">Rp {parseInt(transactionData.gross_amount || '0').toLocaleString()}</p>
                </div>
                {transactionData.transaction_time && (
                  <div className="md:col-span-2">
                    <p className="text-red-300 text-sm">Transaction Time</p>
                    <p className="text-red-100">{new Date(transactionData.transaction_time).toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              {transactionData.status_changed && (
                <div className="mt-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
                  <p className="text-green-400 text-sm">
                    ✓ Status updated from <span className="font-semibold">{transactionData.local_status}</span> to <span className="font-semibold">{transactionData.updated_status}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-32 h-32 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-500/30">
                <CheckCircle className="w-20 h-20 text-green-400" />
              </div>
              
              <h1 className="text-4xl font-bold text-green-400 mb-4">
                Payment Successful!
              </h1>
              
              <p className="text-lg text-red-200 mb-8">
                Thank you for your purchase. Your order has been confirmed and is being processed.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => router.push(`/orders/${orderId}/confirmation`)}
                >
                  <CheckCircle className="w-4 h-4" />
                  View Order Details
                </Button>
                
                <Button
                  variant="outline"
                  className="gap-2 border-red-400 text-red-500 hover:bg-red-800 hover:text-white"
                  onClick={() => router.push('/products')}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Continue Shopping
                </Button>
              </div>

              {/* HAPUS SELURUH BAGIAN DEBUG TOOLS */}
              {/* 
              <div className="mt-8 pt-8 border-t border-red-800/50">
                <p className="text-red-300 text-sm mb-4">Debug Tools:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => manualUpdateStatus('PAID')}
                    className="border-green-400 text-green-400 hover:bg-green-900/30"
                  >
                    Mark as PAID
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`https://dashboard.sandbox.midtrans.com/transactions/${orderId}`, '_blank')}
                    className="border-blue-400 text-blue-400 hover:bg-blue-900/30 gap-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in Midtrans
                  </Button>
                </div>
              </div>
              */}
            </div>
          )}
          
          {status === 'pending' && (
            <div className="text-center">
              <div className="w-32 h-32 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-yellow-500/30">
                <Clock className="w-20 h-20 text-yellow-400" />
              </div>
              
              <h1 className="text-4xl font-bold text-yellow-400 mb-4">
                Payment Pending
              </h1>
              
              <p className="text-lg text-red-200 mb-8">
                Your payment is being processed. Please complete the payment or wait for confirmation.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={() => router.push('/orders')}
                >
                  <Clock className="w-4 h-4" />
                  Check Order Status
                </Button>
                
                <Button
                  variant="outline"
                  className="gap-2 border-red-400 text-red-100 hover:bg-red-800"
                  onClick={() => router.push('/')}
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </div>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center">
              <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-red-500/30">
                <XCircle className="w-20 h-20 text-red-400" />
              </div>
              
              <h1 className="text-4xl font-bold text-red-400 mb-4">
                Payment Failed
              </h1>
              
              <p className="text-lg text-red-200 mb-8">
                We couldn't process your payment. Please try again or use a different payment method.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {orderId && (
                  <Button
                    className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => router.push(`/orders/${orderId}/checkout`)}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Try Again
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="gap-2 border-red-400 text-red-100 hover:bg-red-800"
                  onClick={() => router.push('/support')}
                >
                  <AlertCircle className="w-4 h-4" />
                  Contact Support
                </Button>
              </div>
            </div>
          )}

          {/* Default view if no status determined */}
          {!status && (
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-gray-500/30">
                <AlertCircle className="w-20 h-20 text-gray-400" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-400 mb-4">
                Payment Status Unknown
              </h1>
              
              <p className="text-lg text-red-200 mb-8">
                We couldn't determine the payment status. Please check your order history or contact support.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => router.push('/orders')}
                >
                  <Clock className="w-4 h-4" />
                  View Orders
                </Button>
                
                <Button
                  variant="outline"
                  className="gap-2 border-red-400 text-red-100 hover:bg-red-800"
                  onClick={() => router.push('/')}
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}