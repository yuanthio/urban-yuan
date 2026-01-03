// e-commerce/frontend/components/supplier/DeleteProductDialog.tsx 
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Trash2, AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  product: any;
  onConfirm: () => void;
  isDeleting?: boolean;
};

export default function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
  isDeleting = false,
}: Props) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-105">
        {/* Dialog Header */}
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Delete Product
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Remove this product from your inventory
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Dialog Body */}
        <div className="py-6">
          {/* Warning Alert */}
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">
                This action cannot be undone
              </p>
              <p className="text-sm text-red-700 mt-1">
                All product data, including images and sales history, will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Product to be deleted:</p>
            <div className="flex items-center gap-3">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-600">
                  Price: Rp {product.price?.toLocaleString()} | Stock: {product.stock}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="border-t border-gray-200 pt-4">
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>

            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-700 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <>
                  <Spinner className="mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

