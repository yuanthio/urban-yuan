// e-commerce/frontend/app/orders/[id]/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SharedNavbar from "@/components/layout/SharedNavbar";
import OrderSummary from "@/components/orders/OrderSummary";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { 
  CreditCard, 
  Landmark, 
  Smartphone, 
  ShoppingBag, 
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Wallet,
  QrCode,
  Store,
  Building
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
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

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  banks?: string[];
  stores?: string[];
}

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [selectedStore, setSelectedStore] = useState<string>("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && id) {
      fetchOrder();
      fetchPaymentMethods();
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
      if (!data || !data.id || !data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid order data');
      }
      
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/methods`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const data = await response.json();
      setPaymentMethods(data);
      
      // Default select first enabled method
      const firstEnabled = data.find((method: PaymentMethod) => method.enabled);
      if (firstEnabled) {
        setSelectedMethod(firstEnabled.id);
        
        // Set default bank/store if applicable
        if (firstEnabled.id === 'bank_transfer' && firstEnabled.banks && firstEnabled.banks.length > 0) {
          setSelectedBank(firstEnabled.banks[0]);
        }
        if (firstEnabled.id === 'cstore' && firstEnabled.stores && firstEnabled.stores.length > 0) {
          setSelectedStore(firstEnabled.stores[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      // Fallback payment methods
      setPaymentMethods([
        {
          id: 'credit_card',
          name: 'Credit Card',
          description: 'Pay with Visa, MasterCard, or JCB',
          icon: 'credit-card',
          enabled: true,
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'Transfer via BCA, BNI, BRI, or Mandiri',
          icon: 'bank',
          enabled: true,
          banks: ['bca', 'bni', 'bri', 'mandiri'],
        },
        {
          id: 'gopay',
          name: 'GoPay',
          description: 'Pay with GoPay wallet',
          icon: 'wallet',
          enabled: true,
        },
        {
          id: 'shopeepay',
          name: 'ShopeePay',
          description: 'Pay with ShopeePay',
          icon: 'shopping-bag',
          enabled: true,
        },
        {
          id: 'qris',
          name: 'QRIS',
          description: 'Scan QR code to pay',
          icon: 'qr-code',
          enabled: true,
        },
        {
          id: 'cstore',
          name: 'Convenience Store',
          description: 'Pay at Alfamart or Indomaret',
          icon: 'store',
          enabled: true,
          stores: ['alfamart', 'indomaret'],
        },
      ]);
      setSelectedMethod('credit_card');
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

  const handlePayment = async () => {
    if (!order || !selectedMethod) return;

    // Validate selection for bank transfer and convenience store
    if (selectedMethod === 'bank_transfer' && !selectedBank) {
      toast.error('Please select a bank');
      return;
    }
    
    if (selectedMethod === 'cstore' && !selectedStore) {
      toast.error('Please select a store');
      return;
    }

    setProcessing(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Prepare payment data
      const paymentData: any = {
        paymentMethod: selectedMethod,
      };
      
      // Add specific data for bank transfer
      if (selectedMethod === 'bank_transfer' && selectedBank) {
        paymentData.bank = selectedBank;
      }
      
      // Add specific data for convenience store
      if (selectedMethod === 'cstore' && selectedStore) {
        paymentData.store = selectedStore;
      }

      // Get payment token from backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment/${order.id}/token`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment initialization failed');
      }

      const data = await response.json();
      
      // Redirect to Midtrans payment page
      window.location.href = data.redirect_url;

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment initialization failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentIcon = (iconName: string) => {
    switch (iconName) {
      case 'credit-card':
        return <CreditCard className="w-5 h-5" />;
      case 'bank':
        return <Landmark className="w-5 h-5" />;
      case 'wallet':
        return <Wallet className="w-5 h-5" />;
      case 'shopping-bag':
        return <ShoppingBag className="w-5 h-5" />;
      case 'qr-code':
        return <QrCode className="w-5 h-5" />;
      case 'store':
        return <Store className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getBankLogo = (bankId: string) => {
    const logos: Record<string, { 
      bg: string; 
      text: string; 
      name: string;
      color: string;
    }> = {
      bca: { 
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600', 
        text: 'BCA', 
        name: 'BCA',
        color: 'bg-blue-600'
      },
      bni: { 
        bg: 'bg-gradient-to-r from-green-500 to-green-600', 
        text: 'BNI', 
        name: 'BNI',
        color: 'bg-green-600'
      },
      bri: { 
        bg: 'bg-gradient-to-r from-red-500 to-red-600', 
        text: 'BRI', 
        name: 'BRI',
        color: 'bg-red-600'
      },
      mandiri: { 
        bg: 'bg-gradient-to-r from-yellow-500 to-yellow-600', 
        text: 'MDR', 
        name: 'Mandiri',
        color: 'bg-yellow-600'
      },
    };
    
    return logos[bankId] || { 
      bg: 'bg-gradient-to-r from-gray-500 to-gray-600', 
      text: 'BNK', 
      name: 'Bank',
      color: 'bg-gray-600'
    };
  };

  const getStoreLogo = (storeId: string) => {
    const stores: Record<string, { 
      bg: string; 
      name: string;
      color: string;
    }> = {
      alfamart: { 
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600', 
        name: 'Alfamart',
        color: 'bg-blue-600'
      },
      indomaret: { 
        bg: 'bg-gradient-to-r from-green-500 to-green-600', 
        name: 'Indomaret',
        color: 'bg-green-600'
      },
    };
    
    return stores[storeId] || { 
      bg: 'bg-gradient-to-r from-gray-500 to-gray-600', 
      name: 'Store',
      color: 'bg-gray-600'
    };
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950 flex items-center justify-center">
        <div className="text-red-100">Loading checkout...</div>
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

  // Get selected payment method
  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);

  return (
    <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950">
      <SharedNavbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-red-50 mb-4">
            Checkout
          </h1>
          <p className="text-lg text-red-200">
            Complete your purchase securely with Midtrans
          </p>
          <p className="text-sm text-red-300 mt-2">
            Order ID: {order.id.slice(0, 8)}...
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Select Payment Method
              </h2>
              
              <div className="space-y-4">
                {paymentMethods
                  .filter(method => method.enabled)
                  .map((method) => (
                    <div
                      key={method.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedMethod === method.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedMethod(method.id);
                        // Reset selections when changing payment method
                        if (method.id !== 'bank_transfer') setSelectedBank("");
                        if (method.id !== 'cstore') setSelectedStore("");
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedMethod === method.id ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <div className={selectedMethod === method.id ? 'text-red-600' : 'text-gray-600'}>
                              {getPaymentIcon(method.icon)}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {method.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          selectedMethod === method.id
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedMethod === method.id && (
                            <div className="w-2 h-2 rounded-full bg-white m-auto mt-0.5"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Bank options for bank transfer */}
                      {method.id === 'bank_transfer' && method.banks && selectedMethod === method.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Select Bank:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {method.banks.map((bank) => {
                              const logo = getBankLogo(bank);
                              return (
                                <div
                                  key={bank}
                                  className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
                                    selectedBank === bank
                                      ? 'ring-2 ring-red-500 ring-offset-2'
                                      : 'hover:opacity-90'
                                  } ${logo.bg} text-white text-xs font-medium`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBank(bank);
                                  }}
                                >
                                  {logo.name}
                                </div>
                              );
                            })}
                          </div>
                          {selectedBank && (
                            <div className="mt-3 text-sm text-gray-600">
                              Selected: <span className="font-semibold">{getBankLogo(selectedBank).name}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Store options for convenience store */}
                      {method.id === 'cstore' && method.stores && selectedMethod === method.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Select Store:
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {method.stores.map((store) => {
                              const storeLogo = getStoreLogo(store);
                              return (
                                <div
                                  key={store}
                                  className={`p-3 rounded-lg text-center cursor-pointer transition-all ${
                                    selectedStore === store
                                      ? 'ring-2 ring-red-500 ring-offset-2'
                                      : 'hover:opacity-90'
                                  } ${storeLogo.bg} text-white text-xs font-medium capitalize`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStore(store);
                                  }}
                                >
                                  {storeLogo.name}
                                </div>
                              );
                            })}
                          </div>
                          {selectedStore && (
                            <div className="mt-3 text-sm text-gray-600">
                              Selected: <span className="font-semibold capitalize">{selectedStore}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
              
              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={!selectedMethod || processing || 
                  (selectedMethod === 'bank_transfer' && !selectedBank) ||
                  (selectedMethod === 'cstore' && !selectedStore)}
                className="w-full mt-6 gap-2 py-6 text-lg bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Continue to Payment
                  </>
                )}
              </Button>
              
              {/* Security Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Secured by Midtrans - PCI DSS Compliant</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Money Back Guarantee - 30 Days Return</span>
                </div>
              </div>
            </div>
            
            {/* Payment Instructions */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                How to Pay
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Select your preferred payment method
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    You will be redirected to secure Midtrans payment page
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-sm">3</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Complete the payment process
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-sm">4</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    You will be redirected back to order confirmation page
                  </p>
                </div>
              </div>
              
              {/* Selected Method Instructions */}
              {selectedPaymentMethod && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">
                    How to pay with {selectedPaymentMethod.name}:
                  </h4>
                  {selectedPaymentMethod.id === 'credit_card' && (
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                      <li>Enter your card details (card number, expiry date, CVV)</li>
                      <li>Complete 3D Secure authentication if required</li>
                      <li>Payment will be processed immediately</li>
                    </ul>
                  )}
                  {selectedPaymentMethod.id === 'bank_transfer' && selectedBank && (
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                      <li>Virtual account number will be provided</li>
                      <li>Transfer exact amount to the virtual account</li>
                      <li>Payment confirmation takes 1-3 minutes</li>
                    </ul>
                  )}
                  {selectedPaymentMethod.id === 'gopay' && (
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                      <li>Scan QR code or open GoPay app</li>
                      <li>Confirm payment in the app</li>
                      <li>Payment is instant</li>
                    </ul>
                  )}
                  {selectedPaymentMethod.id === 'qris' && (
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                      <li>Scan the displayed QR code</li>
                      <li>Confirm payment in your banking/e-wallet app</li>
                      <li>Payment is instant</li>
                    </ul>
                  )}
                  {selectedPaymentMethod.id === 'cstore' && selectedStore && (
                    <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                      <li>Payment code will be provided</li>
                      <li>Bring code to nearest {selectedStore}</li>
                      <li>Pay at the cashier</li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-8">
            <OrderSummary order={order} />
            
            {/* Security & Support */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Payment Security
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">SSL Secured</h4>
                    <p className="text-sm text-gray-600">
                      Your payment information is encrypted with 256-bit SSL
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">PCI DSS Compliant</h4>
                    <p className="text-sm text-gray-600">
                      Certified secure payment processing by Midtrans
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">No Card Storage</h4>
                    <p className="text-sm text-gray-600">
                      We never store your card details
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <Building className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Regulated</h4>
                    <p className="text-sm text-gray-600">
                      Licensed and regulated by Bank Indonesia
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Support Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="font-medium">Email:</span>
                    <a href="mailto:support@shophub.com" className="text-blue-600 hover:underline">
                      support@shophub.com
                    </a>
                  </p>
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="font-medium">WhatsApp:</span>
                    <a href="https://wa.me/6281234567890" className="text-blue-600 hover:underline">
                      +62 812 3456 7890
                    </a>
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Hours:</span> 24/7 Customer Support
                  </p>
                </div>
              </div>
              
              {/* Midtrans Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Powered by Midtrans</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Midtrans is Indonesia's leading payment gateway, trusted by thousands of businesses.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500">PCI DSS Certified</span>
                </div>
              </div>
            </div>
            
            {/* Test Payment Info (only in development) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                  🧪 Test Mode - Sandbox Environment
                </h3>
                <div className="space-y-2 text-sm text-yellow-700">
                  <p className="font-medium">Use these test credentials:</p>
                  <ul className="space-y-1 list-disc pl-5">
                    <li><strong>Credit Card:</strong> 4811 1111 1111 1114</li>
                    <li><strong>CVV:</strong> 123</li>
                    <li><strong>Expiry:</strong> 12/34</li>
                    <li><strong>OTP:</strong> 112233</li>
                  </ul>
                  <p className="pt-2 text-xs">
                    No real money will be charged. This is for testing only.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}