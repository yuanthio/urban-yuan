// e-commerce/frontend/components/landing/ProductShowcase.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingCart, Sparkles, TrendingUp, CreditCard, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ProductGrid from "@/components/user/ProductGrid";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  stock?: number;
  size?: string[];
  images?: string[];
};

export default function ProductShowcase() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/products?limit=8`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Perbaikan: Handle response yang berupa object dengan pagination
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          // Fallback untuk response langsung array
          setProducts(data.slice(0, 8));
        } else {
          console.error("Invalid API response structure:", data);
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <section id="products" className="py-20 bg-linear-to-br from-red-900 to-red-950 px-4 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-red-600 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-red-400 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-red-400 animate-pulse" />
                <div className="w-2 h-2 bg-red-400 rounded-full animate-ping" />
                <Sparkles className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
              <p className="text-red-200 text-lg">Loading amazing products...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20 bg-linear-to-br from-red-900 to-red-950 px-4 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-red-600 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-red-400 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-800/50 backdrop-blur-sm border border-red-700/50 px-4 py-2 rounded-full mb-6">
            <TrendingUp className="w-4 h-4 text-red-300" />
            <span className="text-red-200 text-sm font-medium">Best Sellers</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-red-50 mb-6">
            Featured Products
          </h2>
          <p className="text-lg text-red-200 max-w-2xl mx-auto">
            Discover our curated collection of premium products from trusted suppliers
          </p>
        </div>

        {/* Menggunakan ProductGrid yang sama dengan halaman products */}
        <ProductGrid 
          products={products}
          variant="grid"
          columns={4}
          showDescription={true}
          showStock={true}
          showViewAll={false}
        />
        
        {/* View All Button */}
        <div className="text-center mt-16">
          <Button 
            className="gap-2 border-red-500 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full"
            onClick={() => router.push('/products')}
          >
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-red-300 text-sm mt-4">
            Showing {products.length} of many amazing products
          </p>
        </div>
      </div>
    </section>
  );
}