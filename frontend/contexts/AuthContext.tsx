// e-commerce/frontend/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";

// Interface untuk CartItem dengan size
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

// Interface untuk OrderItem dengan size
interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string; // TAMBAH FIELD SIZE
  imageUrl?: string;
}

interface OrderData {
  items: OrderItem[];
  totalPrice: number;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  items: any[];
}

interface ProfileData {
  id: string;
  email: string;
  role: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  session: Session | null;
  isLoading: boolean;
  cartItems: CartItem[];
  cartTotalItems: number;
  isAddingToCart: boolean;
  // UPDATE FUNGSI addToCart UNTUK MENERIMA 6 PARAMETER
  addToCart: (
    productId: string, 
    productName: string, 
    price: number, 
    imageUrl?: string, 
    quantity?: number, 
    size?: string
  ) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  createOrder: (orderData: OrderData) => Promise<string>;
  getUserOrders: () => Promise<Order[]>;
  clearCartAnimation: () => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: { fullName?: string; avatarUrl?: string }) => Promise<{ profile: ProfileData }>;
  deleteProfile: () => Promise<{ profile: ProfileData }>;
  getProfile: () => Promise<ProfileData>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const cartTotalItems = cartItems.length;

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      loadCartFromDatabase();
    } else {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  }, [user]);

  const loadCartFromDatabase = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const cartData = await response.json();
        const formattedItems = cartData.items?.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          size: item.size || undefined, // TAMBAH SIZE
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            imageUrl: item.product.imageUrl,
            stock: item.product.stock,
            size: item.product.size || [], // TAMBAH PRODUCT SIZE OPTIONS
          },
        })) || [];
        setCartItems(formattedItems);
      }
    } catch (error) {
      console.error('Failed to load cart from database:', error);
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    }
  };

  useEffect(() => {
    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsLoading(false);
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      getProfile().then(profileData => {
        setProfile(profileData);
      }).catch(error => {
        console.error('Failed to load profile:', error);
        setProfile(null);
      });
    } else {
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const getProfile = async (): Promise<ProfileData> => {
    if (!user) {
      throw new Error('User must be logged in to get profile');
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  };

  const updateProfile = async (data: { fullName?: string; avatarUrl?: string }) => {
    if (!user) {
      throw new Error('User must be logged in to update profile');
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const result = await response.json();
      toast.success('Profile updated successfully');
      
      // Update profile state
      setProfile(result.profile);
      
      // Force re-render untuk update UI jika avatar diubah
      setUser(prev => prev ? { ...prev } : null);
      
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const deleteProfile = async () => {
    if (!user) {
      throw new Error('User must be logged in to delete profile');
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete profile');
      }

      const result = await response.json();
      toast.success('Profile data cleared successfully');
      
      // Force re-render untuk update UI
      setUser(prev => prev ? { ...prev } : null);
      
      return result;
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  };

  // PERBAIKI FUNGSI addToCart UNTUK MENERIMA 6 PARAMETER
  const addToCart = async (
    productId: string, 
    productName: string, 
    price: number, 
    imageUrl?: string, 
    quantity: number = 1, 
    size?: string // TAMBAH PARAMETER SIZE
  ) => {
    if (!user) {
      throw new Error('User must be logged in to add to cart');
    }

    setIsAddingToCart(true);
    
    try {
      const token = await getAccessToken();
      
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          size, // TAMBAH SIZE
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add to cart');
      }

      await loadCartFromDatabase();
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      setCartItems(currentItems => {
        const existingItem = currentItems.find(item => 
          item.product.id === productId && item.size === size
        );
        
        if (existingItem) {
          return currentItems.map(item =>
            item.product.id === productId && item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: Date.now().toString(),
            product: {
              id: productId,
              name: productName,
              price,
              imageUrl
            },
            quantity,
            size // TAMBAH SIZE
          };
          return [...currentItems, newItem];
        }
      });
      
      throw error;
    } finally {
      setIsAddingToCart(false);
    }
  };

  const createOrder = async (orderData: OrderData): Promise<string> => {
    if (!user) {
      throw new Error('User must be logged in to create order');
    }

    try {
      const token = await getAccessToken();
      
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create order');
      }

      const result = await response.json();
      
      console.log('Order created successfully:', result);
      
      // Return order ID - Cart component will handle removing selected items individually
      return result.id;
    } catch (error: any) {
      console.error('Error creating order:', error);
      
      // Provide more specific error messages based on the error
      if (error.message.includes("Insufficient stock")) {
        throw new Error(error.message);
      } else if (error.message.includes("Product not found")) {
        throw new Error("One or more products are no longer available");
      } else if (error.message.includes("same supplier")) {
        throw new Error("All items must be from the same supplier in one order. Please checkout items from different suppliers separately.");
      } else if (error.message.includes("No items in order")) {
        throw new Error("No items selected for checkout");
      } else if (error.message.includes("Unauthorized")) {
        throw new Error("Please login to create an order");
      } else {
        throw new Error("Failed to create order. Please try again.");
      }
    }
  };

  const getUserOrders = async (): Promise<Order[]> => {
    if (!user) {
      throw new Error('User must be logged in to view orders');
    }

    try {
      const token = await getAccessToken();
      
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    const previousCartItems = [...cartItems];
    const removedItem = cartItems.find(item => item.id === itemId);
    
    setCartItems(currentItems => currentItems.filter(item => item.id !== itemId));

    if (!user) {
      toast.success(`${removedItem?.product.name || 'Item'} berhasil dihapus dari keranjang`);
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove from cart');
      }

      toast.success(`${removedItem?.product.name || 'Item'} berhasil dihapus dari keranjang`);
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCartItems(previousCartItems);
      toast.error('Gagal menghapus item dari keranjang');
    }
  };

  const updateCartItem = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );

    if (!user) {
      return;
    }

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update cart item');
      }

      await loadCartFromDatabase();
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  const clearCartAnimation = () => {
    setIsAddingToCart(false);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    cartItems,
    cartTotalItems,
    isAddingToCart,
    addToCart, // Fungsi yang sudah diperbaiki
    removeFromCart,
    updateCartItem,
    createOrder,
    getUserOrders,
    clearCartAnimation,
    signIn,
    signUp,
    signOut,
    updateProfile,
    deleteProfile,
    getProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
