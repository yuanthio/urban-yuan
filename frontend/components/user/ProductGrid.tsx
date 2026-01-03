// e-commerce/frontend/components/user/ProductGrid.tsx
"use client";

import ProductCard from "./ProductCard";

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  stock?: number;
  size?: string[]; // TAMBAH
  images?: string[]; // TAMBAH
};

interface ProductGridProps {
  products: Product[];
  variant?: "grid" | "list" | "compact";
  columns?: number;
  showDescription?: boolean;
  showStock?: boolean;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export default function ProductGrid({
  products,
  variant = "grid",
  columns = 4,
  showDescription = true,
  showStock = true,
  showViewAll = false,
  onViewAll,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-800/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-red-700/50">
          <svg
            className="w-8 h-8 text-red-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-100 mb-2">
          No products found
        </h3>
        <p className="text-red-300">Check back later for new products</p>
      </div>
    );
  }

  const gridClass =
    {
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  if (variant === "list") {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="list"
              showDescription={showDescription}
              showStock={showStock}
            />
          ))}
        </div>

        {showViewAll && onViewAll && (
          <div className="text-center pt-6">
            <button
              onClick={onViewAll}
              className="text-red-300 hover:text-red-100 font-medium text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              View all products
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="grid"
              showDescription={showDescription}
              showStock={showStock}
            />
          ))}
        </div>

        {showViewAll && onViewAll && (
          <div className="text-center pt-6">
            <button
              onClick={onViewAll}
              className="text-red-300 hover:text-red-100 font-medium text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
            >
              View all products
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default grid view
  return (
    <div className="space-y-6">
      <div className={`grid ${gridClass} gap-6`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant="grid"
            showDescription={showDescription}
            showStock={showStock}
          />
        ))}
      </div>

      {showViewAll && onViewAll && (
        <div className="text-center pt-6">
          <button
            onClick={onViewAll}
            className="text-red-300 hover:text-red-100 font-medium text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            View all products
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
