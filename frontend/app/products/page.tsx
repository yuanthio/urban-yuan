// e-commerce/frontend/app/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import SharedNavbar from "@/components/layout/SharedNavbar";
import ProductGrid from "@/components/user/ProductGrid";
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  stock?: number;
  createdAt?: string;
};

interface ApiResponse {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Initialize search term from URL params
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  const loadProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/products?page=${page}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data: ApiResponse = await res.json();
      
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        setFilteredProducts(data.products);
        setPagination(data.pagination);
      } else {
        console.error("Invalid API response structure:", data);
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
      // Fallback: try direct route
      try {
        const fallbackRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/products`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          if (Array.isArray(fallbackData)) {
            setProducts(fallbackData);
            setFilteredProducts(fallbackData);
          } else if (fallbackData.products && Array.isArray(fallbackData.products)) {
            setProducts(fallbackData.products);
            setFilteredProducts(fallbackData.products);
          }
        }
      } catch (fallbackErr) {
        console.error("Fallback also failed:", fallbackErr);
        setProducts([]);
        setFilteredProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let result = [...products];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        // Sort by ID as fallback since createdAt might not be available
        result.sort((a, b) => (b.createdAt || b.id).localeCompare(a.createdAt || a.id));
        break;
    }

    setFilteredProducts(result);
  }, [products, searchTerm, sortBy]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadProducts(page);
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
              <p className="text-red-200 text-lg">Loading all products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-900 to-red-950">
      <SharedNavbar />
      
      {/* Header */}
      <div className="text-white py-6 px-4 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-red-600 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-red-400 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-800/50 backdrop-blur-sm border border-red-700/50 px-4 py-2 rounded-full mb-6">
              <Filter className="w-4 h-4 text-red-300" />
              <span className="text-red-200 text-sm font-medium">All Products</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-red-50 mb-6">
              Complete Product Collection
            </h1>
            <p className="text-lg text-red-200 max-w-2xl mx-auto mb-8">
              Discover our complete collection of premium products from trusted suppliers
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-red-300" />
              </div>
              <input
                type="text"
                placeholder="Search products by name or description..."
                className="w-full pl-10 pr-4 py-3 bg-red-800/50 backdrop-blur-sm border border-red-700/50 rounded-xl text-white placeholder-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-4 bg-red-800/20 backdrop-blur-md border border-red-700/30 rounded-2xl">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-red-300" />
            <span className="text-red-200 font-medium">{filteredProducts.length} products found</span>
            {searchTerm && (
              <span className="text-red-300 text-sm">
                for "{searchTerm}"
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Sort Selector */}
            <select
              className="px-4 py-2 bg-red-800/50 backdrop-blur-sm border border-red-700/50 rounded-lg text-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest" className="bg-red-900">Sort by: Newest</option>
              <option value="price-low" className="bg-red-900">Price: Low to High</option>
              <option value="price-high" className="bg-red-900">Price: High to Low</option>
              <option value="name" className="bg-red-900">Name: A to Z</option>
            </select>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 border border-red-600/50 rounded-lg p-1 bg-red-800/30">
              <button
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-700 text-red-100' : 'text-red-300'}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-700 text-red-100' : 'text-red-300'}`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className={viewMode === 'grid' ? '' : 'space-y-4'}>
          {viewMode === 'grid' ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            // List View
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300 p-4 flex items-center gap-4 cursor-pointer"
                  onClick={() => router.push(`/products/${product.id}`)}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-red-600">
                          Rp {product.price.toLocaleString()}
                        </span>
                        {product.stock !== undefined && (
                          <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        )}
                      </div>
                      <Button 
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/products/${product.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button 
              variant="outline" 
              size="icon" 
              className="border-red-500 text-red-500 hover:bg-red-800 hover:border-red-400"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }
              
              return (
                <Button 
                  key={pageNum}
                  variant="outline" 
                  className={`w-10 h-10 ${pagination.currentPage === pageNum ? 'bg-red-600 text-white hover:bg-red-700 border-red-500' : 'border-red-500 text-red-500 hover:bg-red-800 hover:border-red-400'}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
            
            {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
              <span className="px-2 text-red-300">...</span>
            )}
            
            {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
              <Button 
                variant="outline" 
                className="w-10 h-10 border-red-500 text-red-500 hover:bg-red-800 hover:border-red-400"
                onClick={() => handlePageChange(pagination.totalPages)}
              >
                {pagination.totalPages}
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="icon" 
              className="border-red-500 text-red-500 hover:bg-red-800 hover:border-red-400"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-red-800/20 backdrop-blur-md border border-red-700/30 rounded-2xl">
            <div className="w-20 h-20 bg-red-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-red-300" />
            </div>
            <h3 className="text-xl font-semibold text-red-50 mb-2">No products found</h3>
            <p className="text-red-200 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `No products matching "${searchTerm}" found. Try different keywords.`
                : "No products available at the moment. Please check back later."}
            </p>
            {searchTerm && (
              <Button 
                variant="outline"
                onClick={() => setSearchTerm("")}
                className="border-red-400 text-red-500 hover:bg-red-800 hover:border-red-300"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}