// e-commerce/frontend/components/supplier/ProductDialog.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Package, Upload, X, Plus, Trash2 } from "lucide-react";

type ProductForm = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  size: string[];
  images: string[];
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  size?: string[];
  images?: string[];
  imageUrl?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedProduct?: Product | null; // Ganti dari initialData ke selectedProduct
  onSubmit: (data: ProductForm) => Promise<void> | void;
  isSaving?: boolean;
};

export default function ProductDialog({
  open,
  onOpenChange,
  selectedProduct,
  onSubmit,
  isSaving = false,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [newSize, setNewSize] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Initialize form data when dialog opens or selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      setName(selectedProduct.name || "");
      setDescription(selectedProduct.description || "");
      setPrice(selectedProduct.price?.toString() || "");
      setStock(selectedProduct.stock?.toString() || "");
      setSizes(selectedProduct.size || []);
      setImages(selectedProduct.images || []);
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setSizes([]);
      setImages([]);
      setUploadedFiles([]);
    }
  }, [selectedProduct, open]);

  const handleImageUpload = async (files: FileList) => {
    const newFiles = Array.from(files);
    
    // Validasi ukuran file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = newFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error("Some files exceed 10MB limit");
      return;
    }

    setUploading(true);
    
    try {
      const uploadedUrls: string[] = [];
      
      for (const file of newFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_products");
        
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        
        if (!res.ok) throw new Error("Upload failed");
        
        const data = await res.json();
        uploadedUrls.push(data.secure_url);
      }
      
      setImages(prev => [...prev, ...uploadedUrls]);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} image(s) uploaded successfully`);
      
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    if (newSize.trim() && !sizes.includes(newSize.trim())) {
      setSizes(prev => [...prev, newSize.trim()]);
      setNewSize("");
    }
  };

  const removeSize = (index: number) => {
    setSizes(prev => prev.filter((_, i) => i !== index));
  };

  async function handleSubmit() {
    if (!name || price === "" || stock === "") {
      toast.warning("Please fill all required fields");
      return;
    }

    try {
      const productData: ProductForm = {
        name,
        description: description || undefined,
        price: Number(price),
        stock: Number(stock),
        size: sizes,
        images,
      };

      await onSubmit(productData);
      onOpenChange(false);
      
    } catch {
      toast.error("Failed to save product");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-auto">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                {selectedProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                {selectedProduct ? "Update product information" : "Fill in the product details"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Product Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Product Name *</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              className="border-gray-300 focus:border-red-500 focus:ring-red-500"
            />
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Price (Rp) *</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Stock *</Label>
              <Input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Available Sizes</Label>
            <div className="flex gap-2">
              <Input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                placeholder="e.g., 39, 40, 41..."
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
              />
              <Button
                type="button"
                onClick={addSize}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Selected Sizes */}
            {sizes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((size, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-500">Leave empty if product doesn't have sizes</p>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Product Images</Label>
            
            {/* Upload Area */}
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    handleImageUpload(e.target.files);
                  }
                }}
                className="sr-only"
                id="image-upload"
                disabled={uploading}
              />
              
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors ${
                  uploading ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {uploading ? (
                  <>
                    <Spinner className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-500 mt-1">Multiple images allowed (PNG, JPG up to 10MB each)</p>
                  </>
                )}
              </label>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {images.length} image(s) uploaded. First image will be used as thumbnail.
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((url, index) => (
                    <div key={index} className="relative">
                      <div className="text-xs text-gray-500 mb-1 text-center">
                        {index === 0 ? 'Thumbnail' : `Image ${index + 1}`}
                      </div>
                      <div className="relative group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="h-24 w-full rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                            Main
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (index > 0) {
                              const newImages = [...images];
                              [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
                              setImages(newImages);
                            }
                          }}
                          disabled={index === 0}
                          className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 rounded disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (index < images.length - 1) {
                              const newImages = [...images];
                              [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
                              setImages(newImages);
                            }
                          }}
                          disabled={index === images.length - 1}
                          className="flex-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 rounded disabled:opacity-50"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

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
              onClick={handleSubmit} 
              disabled={uploading || isSaving}
              className="flex-1 bg-red-700 hover:bg-red-600 text-white"
            >
              {uploading || isSaving ? (
                <>
                  <Spinner className="mr-2" />
                  {selectedProduct ? "Updating..." : "Saving..."}
                </>
              ) : (
                selectedProduct ? "Update Product" : "Add Product"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}