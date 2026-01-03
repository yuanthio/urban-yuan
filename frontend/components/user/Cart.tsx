// e-commerce/frontend/src/components/user/Cart.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Package,
  CreditCard,
} from "lucide-react";
import SharedNavbar from "@/components/layout/SharedNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// UPDATE INTERFACE CARTITEM
interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    stock?: number;
    size?: string[]; // Product size options
  };
  quantity: number;
  size?: string; // Selected size untuk produk tertentu
}

// UPDATE INTERFACE DATABASECARTITEM
interface DatabaseCartItem {
  id: string;
  quantity: number;
  size?: string; // TAMBAH SIZE
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    stock?: number;
    size?: string[]; // TAMBAH PRODUCT SIZE OPTIONS
  };
}

export default function Cart() {
  const router = useRouter();
  const { user, cartItems, updateCartItem, removeFromCart, createOrder } =
    useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartData, setCartData] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Sync dengan cartItems dari AuthContext
  useEffect(() => {
    setCartData(cartItems);
    // Select all items by default
    setSelectedItems(cartItems.map((item) => item.id));
  }, [cartItems]);

  const getTotalPrice = () => {
    return cartData.reduce((total, item) => {
      if (selectedItems.includes(item.id)) {
        return total + item.product.price * item.quantity;
      }
      return total;
    }, 0);
  };

  const getTotalItems = () => {
    return cartData.reduce((total, item) => {
      if (selectedItems.includes(item.id)) {
        return total + item.quantity;
      }
      return total;
    }, 0);
  };

  const getSelectedItems = () => {
    return cartData.filter((item) => selectedItems.includes(item.id));
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cartData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartData.map((item) => item.id));
    }
  };

  const handleProceedToCheckout = async () => {
    const selectedCartItems = getSelectedItems();

    if (selectedCartItems.length === 0) {
      toast.error("Please select at least one item to checkout");
      return;
    }

    // Check stock availability
    const outOfStockItems = selectedCartItems.filter(
      (item) =>
        item.product.stock !== undefined && item.product.stock < item.quantity
    );

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems
        .map((item) => item.product.name)
        .join(", ");
      toast.error(`Insufficient stock for: ${itemNames}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data dengan size
      const orderData = {
        items: selectedCartItems.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size, // KIRIM SIZE
          imageUrl: item.product.imageUrl || undefined,
        })),
        totalPrice: getTotalPrice(),
      };

      // Create order
      const orderId = await createOrder(orderData);

      toast.success("Order created successfully! Redirecting to checkout...");

      // Remove selected items from cart
      selectedCartItems.forEach((item) => {
        removeFromCart(item.id);
      });

      // Reset selection
      setSelectedItems([]);

      // Redirect to checkout page
      setTimeout(() => {
        router.push(`/orders/${orderId}/checkout`);
      }, 1000);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to process checkout");
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartData.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950">
        <SharedNavbar />

        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="w-32 h-32 bg-red-800 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingCart className="w-16 h-16 text-red-400" />
              </div>
              <div className="inline-flex items-center gap-2 bg-red-800 text-red-100 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <ShoppingCart className="w-4 h-4" />
                Cart Empty
              </div>
              <h2 className="text-4xl font-bold text-red-50 mb-4">
                Your <span className="text-red-400">Cart is Empty</span>
              </h2>
              <p className="text-lg text-red-200 mb-8">
                Looks like you haven't added any items to your cart yet.
              </p>
              <Button
                size="lg"
                className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => router.push("/products")}
              >
                <ShoppingCart className="w-5 h-5" />
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950">
      <SharedNavbar />

      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-800 text-red-100 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <ShoppingCart className="w-4 h-4" />
              Shopping Cart
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-red-50 mb-4">
              Your <span className="text-red-400">Shopping Cart</span>
            </h1>
            <p className="text-lg text-red-200">
              {getTotalItems()} items selected • {cartData.length} items in cart
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {/* Select All */}
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length === cartData.length &&
                      cartData.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="font-medium text-gray-900">
                    Select All ({cartData.length} items)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const confirm = window.confirm(
                      "Are you sure you want to clear your cart?"
                    );
                    if (confirm) {
                      cartData.forEach((item) => removeFromCart(item.id));
                    }
                  }}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>

              {/* Cart Items */}
              {cartData.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleSelectItem(item.id)}
                        className="w-5 h-5 mt-3 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                    </div>

                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-gray-200">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ShoppingCart className="w-8 h-8 text-red-600" />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.product.name}
                          </h3>
                          {/* Tampilkan size jika ada */}
                          {item.size && (
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Size:
                              </span>
                              <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                                {item.size}
                              </span>
                            </div>
                          )}
                          <p className="text-gray-600">
                            Rp {item.product.price.toLocaleString()} ×{" "}
                            {item.quantity}
                          </p>
                          {item.product.stock !== undefined && (
                            <p
                              className={`text-sm mt-1 ${
                                item.product.stock > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {item.product.stock > 0
                                ? `${item.product.stock} available`
                                : "Out of stock"}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            Rp{" "}
                            {(
                              item.product.price * item.quantity
                            ).toLocaleString()}
                          </p>
                          {item.product.stock !== undefined &&
                            item.quantity > item.product.stock && (
                              <p className="text-xs text-red-600 mt-1">
                                Only {item.product.stock} in stock
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          onClick={() => updateCartItem(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          onClick={() => updateCartItem(item.id, item.quantity + 1)}
                          disabled={
                            item.product.stock !== undefined &&
                            item.quantity >= item.product.stock
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-gray-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Order Summary
                </h2>

                {/* Selected Items */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Selected Items</span>
                    <span>{getSelectedItems().length} items</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {getSelectedItems().map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="text-gray-700 truncate">
                            {item.product.name}
                          </p>
                          {item.size && (
                            <p className="text-xs text-gray-500">
                              Size: {item.size}
                            </p>
                          )}
                        </div>
                        <span className="text-gray-900 font-medium whitespace-nowrap">
                          {item.quantity} × Rp{" "}
                          {item.product.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>Rp {getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (10%)</span>
                    <span>
                      Rp {Math.floor(getTotalPrice() * 0.1).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>
                        Rp {Math.floor(getTotalPrice() * 1.1).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full gap-2 py-6 text-lg bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white mb-3"
                  onClick={handleProceedToCheckout}
                  disabled={isProcessing || getSelectedItems().length === 0}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Proceed to Checkout ({getSelectedItems().length} items)
                    </>
                  )}
                </Button>

                {/* Continue Shopping */}
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => router.push("/products")}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>

                {/* Additional Info */}
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-green-600" />
                    <span>Free shipping on orders over Rp 500,000</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Secure payment with SSL encryption</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
