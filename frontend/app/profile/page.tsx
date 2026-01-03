// e-commerce/frontend/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SharedNavbar from "@/components/layout/SharedNavbar";
import ProfileForm from "@/components/user/ProfileForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Package, ShoppingCart, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface ProfileData {
  id: string;
  email: string;
  role: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    orders: 0,
    cartItems: 0,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      loadProfile();
      loadStats();
    }
  }, [user, isLoading, router]);

  const loadProfile = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const token = await getAccessToken();
      if (!token) return;

      // Load orders count
      const ordersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setStats(prev => ({ ...prev, orders: ordersData.length }));
      }

      // Load cart items count
      const cartResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        setStats(prev => ({ ...prev, cartItems: cartData.items?.length || 0 }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
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

  const handleUpdateProfile = async (data: { fullName?: string; avatarUrl?: string }) => {
    if (!user || !profile) return;

    setUpdating(true);
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
      setProfile(result.profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user) return;

    setUpdating(true);
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
        throw new Error(error.error || 'Failed to clear profile');
      }

      const result = await response.json();
      setProfile(result.profile);
      toast.success('Profile data cleared successfully');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to clear profile data');
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950 flex items-center justify-center">
        <div className="text-red-100">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-100 mb-4">Profile not found</h2>
          <button
            onClick={() => router.push('/')}
            className="text-red-300 hover:text-red-100"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950">
      <SharedNavbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 gap-2 text-white hover:bg-red-800/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-800 text-red-100 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <User className="w-4 h-4" />
              My Profile
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-red-50 mb-6">
              Profile <span className="text-red-400">Settings</span>
            </h1>
            <p className="text-lg text-red-200 max-w-2xl mx-auto">
              Manage your personal information and account settings
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <ProfileForm
                initialData={profile}
                onUpdate={handleUpdateProfile}
                onDelete={handleDeleteProfile}
                isLoading={updating}
              />
            </div>
          </div>

          {/* Sidebar - Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-lg font-semibold text-gray-900">{stats.orders}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/orders')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    View
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Cart Items</p>
                      <p className="text-lg font-semibold text-gray-900">{stats.cartItems}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/cart')}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    View
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start gap-2 text-gray-700 hover:bg-gray-50"
                  variant="outline"
                  onClick={() => router.push('/orders')}
                >
                  <Package className="w-4 h-4" />
                  View Orders
                </Button>
                
                <Button
                  className="w-full justify-start gap-2 text-gray-700 hover:bg-gray-50"
                  variant="outline"
                  onClick={() => router.push('/cart')}
                >
                  <ShoppingCart className="w-4 h-4" />
                  View Cart
                </Button>
                
                <Button
                  className="w-full justify-start gap-2 text-gray-700 hover:bg-gray-50"
                  variant="outline"
                  onClick={() => router.push('/products')}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Browse Products
                </Button>
              </div>
            </div>

            {/* Account Security */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Security</h2>
              <p className="text-sm text-gray-600 mb-4">
                Your account is secured with Supabase Auth. Email cannot be changed for security reasons.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Email Verified</span>
                  <span className="text-green-600 font-medium">✓ Verified</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Account Created</span>
                  <span className="font-medium">{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-medium capitalize">{profile.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}