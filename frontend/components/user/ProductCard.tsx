// e-commerce/frontend/components/user/ProductCard.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star, Heart, ShoppingCart, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list" | "compact";
  showDescription?: boolean;
  showStock?: boolean;
}

export default function ProductCard({
  product,
  variant = "grid",
  showDescription = true,
  showStock = true,
}: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Hapus semua fungsi handleAddToCart dan handleBuyNow
  // Karena kita ingin seluruh card menjadi klikable

  // Fungsi untuk handle klik pada card
  const handleCardClick = () => {
    router.push(`/products/${product.id}`);
  };

  // Hapus fungsi-fungsi ini:
  // - handleAddToCart
  // - handleBuyNow
  // - state addingProductId
  // - state buyingProductId

  if (variant === "compact") {
    return (
      <div
        className="flex items-center gap-4 p-3 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300 cursor-pointer"
        onClick={handleCardClick} // Tambahkan onclick di sini
      >
        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <div className="text-gray-400">
              <ShoppingCart className="w-6 h-6" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate mb-1">
            {product.name}
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-red-600 font-bold">
              Rp {product.price.toLocaleString()}
            </span>
            {/* Hapus tombol Add di sini */}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "list") {
    return (
      <div
        className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300 p-4 flex items-center gap-4 cursor-pointer"
        onClick={handleCardClick} // Tambahkan onclick di sini
      >
        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-gray-400">
              <ShoppingCart className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {product.name}
          </h3>
          {showDescription && product.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-red-600">
                Rp {product.price.toLocaleString()}
              </span>
              {showStock && product.stock !== undefined && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    product.stock > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              )}
              {product.size && product.size.length > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Size Available
                </span>
              )}
            </div>
            {/* HAPUS KEDUA TOMBOL INI */}
          </div>
        </div>
      </div>
    );
  }

  // Default grid view
  return (
    <div 
      className="group relative bg-white rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
      onClick={handleCardClick} // Tambahkan onclick di sini
    >
      {/* Wishlist Button - Bisa tetap ada karena tidak mengganggu klik ke detail */}
      <button 
        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow"
        onClick={(e) => {
          e.stopPropagation(); // Mencegah event bubbling ke parent
          // Tambahkan logika wishlist di sini jika diperlukan
          toast.info("Wishlist feature coming soon!");
        }}
      >
        <Heart className="w-4 h-4 text-gray-600" />
      </button>

      {/* Product Image */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="text-gray-400">
            <ShoppingCart className="w-16 h-16" />
          </div>
        )}

        {/* Image Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Size indicator badge */}
        {product.size && product.size.length > 0 && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Multiple Sizes
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        {showDescription && product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Rating and Price */}
        <div className="flex flex-col items-start mb-4 gap-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-gray-500 ml-1">(4.8)</span>
          </div>
          <div>
            <p className="text-xl font-bold text-red-600">
              Rp {product.price.toLocaleString()}
            </p>
            {showStock && product.stock !== undefined && (
              <p
                className={`text-xs ${
                  product.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </p>
            )}
          </div>
        </div>

        {/* HAPUS SELURUH SECTION ACTION BUTTONS */}
        {/* 
          <div className="grid grid-cols-2 gap-2">
            <Button ...>
              Buy Now
            </Button>
            <Button ...>
              Add to Cart
            </Button>
          </div>
        */}
        
        {/* Tambahkan hint bahwa card bisa diklik */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            Click to view details
          </p>
        </div>
      </div>
    </div>
  );
}
