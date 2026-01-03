// e-commerce/frontend/components/user/ProductDetail.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Star,
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  TrendingUp,
  Package,
  Shield,
  Truck,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import SharedNavbar from "@/components/layout/SharedNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  size: string[];
  images: string[];
  imageUrl?: string;
};

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { user, addToCart, createOrder } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        if (!params.id) {
          throw new Error("No product ID provided");
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/public/products/detail/${params.id}`
        );

        if (!res.ok) {
          if (res.status === 400) {
            throw new Error("Invalid product ID format");
          } else if (res.status === 404) {
            throw new Error("Product not found");
          } else {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
        }

        const data = await res.json();

        if (!data || typeof data !== "object" || !data.id) {
          throw new Error("Invalid product data received");
        }

        setProduct(data);
        setError(null);
        
        // Set selected size jika ada size options
        if (data.size && data.size.length > 0) {
          setSelectedSize(data.size[0]);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error(
        "Anda harus login terlebih dahulu untuk menambahkan produk ke keranjang"
      );
      router.push("/login");
      return;
    }

    if (!product) return;

    // Validasi size untuk produk sepatu
    if (product.size && product.size.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(
        product.id,
        product.name,
        product.price,
        product.images[0], // Gunakan gambar pertama
        quantity,
        selectedSize // Kirim size yang dipilih
      );

      toast.success(
        `${quantity} ${product.name} (Size: ${selectedSize}) berhasil ditambahkan ke keranjang!`,
        {
          icon: "🛒",
          description: "Item telah ditambahkan ke keranjang belanja Anda",
        }
      );
    } catch (error) {
      toast.error("Gagal menambahkan produk ke keranjang");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Anda harus login terlebih dahulu untuk melakukan pembelian");
      router.push("/login");
      return;
    }

    if (!product) return;

    // Validasi size untuk produk sepatu
    if (product.size && product.size.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }

    if (product.stock < quantity) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    setIsBuyingNow(true);
    try {
      const orderId = await createOrder({
        items: [{
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: quantity,
          size: selectedSize, // Kirim size yang dipilih
          imageUrl: product.images[0]
        }],
        totalPrice: product.price * quantity
      });
      
      toast.success(`Order created! Redirecting to checkout...`);
      
      setTimeout(() => {
        router.push(`/orders/${orderId}/checkout`);
      }, 1000);
      
    } catch (error) {
      toast.error("Failed to process buy now");
      console.error("Buy now error:", error);
    } finally {
      setIsBuyingNow(false);
    }
  };

  const nextImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 0) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950 flex items-center justify-center">
        <div className="text-center text-red-100">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-100 mb-2">
            {error || "Product not found"}
          </h2>
          <p className="text-red-300 mb-6">
            {error
              ? "Please check the product URL and try again."
              : "The product you're looking for doesn't exist."}
          </p>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="border-red-400 text-red-100 hover:bg-red-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950">
      <SharedNavbar />

      <div className="px-4">
        <div className="container mx-auto px-4 pt-6">
          <div className="flex items-center gap-2 text-red-300 text-sm">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-red-300 hover:text-red-100 p-0 h-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Products
            </Button>
            <span>/</span>
            <span>{product.name}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Product Images Section */}
            <div className="space-y-6">
              {/* Main Image */}
              <div 
                className="aspect-square bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-xl cursor-pointer relative"
                onClick={() => setShowImageModal(true)}
              >
                {product.images && product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[selectedImageIndex]}
                      alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    {product.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {product.images.length}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-6xl">No Image</div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index
                          ? 'border-red-500 scale-105'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center shadow-lg border border-gray-100">
                  <Package className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-gray-800 text-sm font-medium">
                    Premium Quality
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-lg border border-gray-100">
                  <Shield className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-gray-800 text-sm font-medium">
                    Authentic
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-lg border border-gray-100">
                  <Truck className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-gray-800 text-sm font-medium">
                    Fast Delivery
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info Section */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-red-800 text-red-100 px-3 py-1 rounded-full text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Best Seller
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-red-50 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < 4 ? "text-yellow-400 fill-current" : "text-red-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-red-200">(4.8) • 256 Reviews</span>
              </div>

              <div className="space-y-2">
                <div className="text-4xl font-bold text-red-100">
                  Rp {product.price.toLocaleString()}
                </div>
                <div
                  className={`text-sm font-medium ${
                    product.stock > 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} items in stock`
                    : "Out of stock"}
                </div>
              </div>

              {/* Size Selection */}
              {product.size && product.size.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-red-100">
                    Select Size
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                          selectedSize === size
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-red-800 text-red-200 hover:border-red-500 hover:bg-red-800'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <p className="text-red-300 text-sm">
                      Selected size: <span className="font-bold">{selectedSize}</span>
                    </p>
                  )}
                </div>
              )}

              {product.description && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-red-100">
                    Description
                  </h3>
                  <p className="text-red-200 leading-relaxed text-lg">
                    {product.description}
                  </p>
                </div>
              )}

              {product.stock > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-red-100">
                    Quantity
                  </h3>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-red-900/50 border-red-600 text-red-100 hover:bg-red-700 hover:text-red-50"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold text-red-50">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-red-900/50 border-red-600 text-red-100 hover:bg-red-700 hover:text-red-50"
                      onClick={() =>
                        setQuantity(Math.min(product.stock, quantity + 1))
                      }
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Button
                  className={`w-full gap-2 py-6 text-lg bg-red-600 hover:bg-red-700 text-white transition-all duration-300 ${
                    isAddingToCart
                      ? "bg-green-600 hover:bg-green-700 scale-95"
                      : ""
                  }`}
                  onClick={handleAddToCart}
                  disabled={
                    product.stock === 0 || 
                    isAddingToCart || 
                    isBuyingNow ||
                    (product.size && product.size.length > 0 && !selectedSize)
                  }
                >
                  <ShoppingCart
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isAddingToCart ? "animate-bounce" : ""
                    }`}
                  />
                  {isAddingToCart
                    ? "Adding to Cart..."
                    : product.stock > 0
                    ? `Add to Cart${selectedSize ? ` (Size: ${selectedSize})` : ''}`
                    : "Out of Stock"}
                </Button>

                <Button
                  className={`w-full gap-2 py-6 text-lg bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 text-white transition-all duration-300 ${
                    isBuyingNow ? "scale-95" : ""
                  }`}
                  onClick={handleBuyNow}
                  disabled={
                    product.stock === 0 || 
                    isBuyingNow || 
                    isAddingToCart ||
                    (product.size && product.size.length > 0 && !selectedSize)
                  }
                >
                  <CreditCard
                    className={`w-5 h-5 transition-transform duration-300 ${
                      isBuyingNow ? "animate-bounce" : ""
                    }`}
                  />
                  {isBuyingNow
                    ? "Processing Order..."
                    : product.stock > 0
                    ? `Buy Now${selectedSize ? ` (Size: ${selectedSize})` : ''}`
                    : "Out of Stock"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-red-800">
                <div>
                  <div className="text-red-100 font-semibold">
                    Free Shipping
                  </div>
                  <div className="text-red-300 text-sm">
                    On orders over Rp 500.000
                  </div>
                </div>
                <div>
                  <div className="text-red-100 font-semibold">
                    30-Day Returns
                  </div>
                  <div className="text-red-300 text-sm">
                    Hassle-free returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && product.images.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-red-400 z-10"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-4xl max-h-[80vh]">
            <img
              src={product.images[selectedImageIndex]}
              alt={`${product.name} - Full view`}
              className="w-full h-full object-contain max-h-[70vh]"
            />
            <div className="text-white text-center mt-4">
              {selectedImageIndex + 1} / {product.images.length}
            </div>
          </div>
          
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          
          {/* Thumbnail strip at bottom */}
          <div className="absolute bottom-4 left-0 right-0 overflow-x-auto px-4">
            <div className="flex gap-2 justify-center">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-16 h-16 rounded overflow-hidden border-2 flex-shrink-0 ${
                    selectedImageIndex === index
                      ? 'border-red-500'
                      : 'border-white/30'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}