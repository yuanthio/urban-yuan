// e-commerce/frontend/components/supplier/HeaderSkeleton.tsx
export default function HeaderSkeleton() {
  return (
    <div className="border-b border-red-700/30 bg-red-900/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="w-48 h-9 bg-gray-300/20 rounded-lg animate-pulse mb-2"></div>
            <div className="w-64 h-5 bg-gray-300/20 rounded animate-pulse"></div>
          </div>
          <div className="w-32 h-10 bg-gray-300/20 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
