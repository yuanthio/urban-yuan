// e-commerce/frontend/app/supplier/product/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Search, Filter, MoreVertical, Package, Edit, Trash2, Image as ImageIcon } from "lucide-react";

import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api/product";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Button } from "@/components/ui/button";
import ProductDialog from "@/components/supplier/ProductDialog";
import DeleteProductDialog from "@/components/supplier/DeleteProductDialog";
import DescriptionDialog from "@/components/supplier/DescriptionDialog";
import ProductTableSkeleton from "@/components/supplier/ProductTableSkeleton";
import SearchFilterSkeleton from "@/components/supplier/SearchFilterSkeleton";
import HeaderSkeleton from "@/components/supplier/HeaderSkeleton";

interface ProductForm {
  name: string;
  description?: string;
  price: number;
  stock: number;
  size: string[];
  images: string[];
}

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  size?: string[];
  images?: string[];
  imageUrl?: string;
  sku?: string;
}

export default function SupplierProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Simpan Product, bukan ProductForm

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState<{ name: string; description: string } | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [priceFilter, setPriceFilter] = useState<"all" | "low" | "medium" | "high">("all");

  async function load() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    try {
      setLoading(true);
      const result = await fetchProducts(data.session.access_token);
      setProducts(result);
    } catch {
      toast.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesStock = true;
    if (stockFilter === "low") {
      matchesStock = product.stock < 10;
    } else if (stockFilter === "medium") {
      matchesStock = product.stock >= 10 && product.stock < 50;
    } else if (stockFilter === "high") {
      matchesStock = product.stock >= 50;
    }

    let matchesPrice = true;
    if (priceFilter === "low") {
      matchesPrice = product.price < 50000;
    } else if (priceFilter === "medium") {
      matchesPrice = product.price >= 50000 && product.price < 200000;
    } else if (priceFilter === "high") {
      matchesPrice = product.price >= 200000;
    }

    return matchesSearch && matchesStock && matchesPrice;
  });

  async function handleCreate(formData: ProductForm) {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    setIsSaving(true);
    try {
      await createProduct(data.session.access_token, formData);
      toast.success("Produk berhasil dibuat");
      await load();
    } catch {
      toast.error("Gagal membuat produk");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(formData: ProductForm) {
    const { data } = await supabase.auth.getSession();
    if (!data.session || !selectedProduct) return;

    setIsSaving(true);
    try {
      // Gunakan ID produk yang dipilih, bukan mencari berdasarkan nama
      await updateProduct(
        data.session.access_token,
        selectedProduct.id, // Gunakan ID dari selectedProduct
        formData
      );
      toast.success("Produk berhasil diupdate");
      setSelectedProduct(null);
      await load();
    } catch (error) {
      console.error("Update product error:", error);
      toast.error("Gagal mengupdate produk");
    } finally {
      setIsSaving(false);
    }
  }

  async function confirmDelete() {
    const { data } = await supabase.auth.getSession();
    if (!data.session || !selectedDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(
        data.session.access_token,
        selectedDelete.id
      );
      toast.success("Produk berhasil dihapus");
      setDeleteOpen(false);
      setSelectedDelete(null);
      await load();
    } catch {
      toast.error("Gagal menghapus produk");
    } finally {
      setIsDeleting(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.imageUrl) {
      return product.imageUrl;
    }
    return null;
  };

  const handleEditProduct = (product: Product) => {
    // Simpan seluruh objek product, bukan dikonversi ke ProductForm
    setSelectedProduct(product);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-red-950 via-red-900 to-red-800">
      {/* Header */}
      {loading ? (
        <HeaderSkeleton />
      ) : (
        <div className="border-b border-red-700/30 bg-red-900/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-red-50">Product</h1>
                <p className="text-red-300 mt-1">Manage your inventory and product listings</p>
              </div>
              <Button 
                className="bg-red-700 hover:bg-red-600 text-white"
                onClick={() => setOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Search and Filter Bar */}
        {loading ? (
          <SearchFilterSkeleton />
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Accordion */}
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="filters" className="border border-gray-200 rounded-lg px-4">
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Filter Product</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter Stok</label>
                      <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value as "all" | "low" | "medium" | "high")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="all">All Stock</option>
                        <option value="low">Low Stock (&lt; 10)</option>
                        <option value="medium">Medium Stock (10-49)</option>
                        <option value="high">High Stock (&ge; 50)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter Price</label>
                      <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value as "all" | "low" | "medium" | "high")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="all">All Price</option>
                        <option value="low">Low Price (&lt; Rp 50.000)</option>
                        <option value="medium">Medium Price (Rp 50.000 - 199.999)</option>
                        <option value="high">High Price (&ge; Rp 200.000)</option>
                      </select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Inventori Product</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {filteredProducts.length} of {products.length} Product
                </span>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {loading ? (
            <ProductTableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12 font-semibold text-gray-700">No</TableHead>
                  <TableHead className="font-semibold text-gray-700">Image</TableHead>
                  <TableHead className="font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Description</TableHead>
                  <TableHead className="font-semibold text-gray-700">Price</TableHead>
                  <TableHead className="font-semibold text-gray-700">Stock</TableHead>
                  <TableHead className="font-semibold text-gray-700">Sizes</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">
                          {searchQuery || stockFilter !== "all" || priceFilter !== "all" 
                            ? "Tidak ada produk yang cocok dengan filter" 
                            : "Belum ada produk"}
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => setOpen(true)}
                          className="bg-red-700 hover:bg-red-600 text-white"
                        >
                          Add Product
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {filteredProducts.map((p, index) => {
                  const productImage = getProductImage(p);
                  return (
                    <TableRow key={p.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">{index + 1}</TableCell>

                      <TableCell>
                        {productImage ? (
                          <img
                            src={productImage}
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                            alt={p.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.style.display = 'none';
                              target.parentElement!.innerHTML = `
                                <div class="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          <p className="text-sm text-gray-600 mt-1">ID: {p.id.slice(0, 8)}...</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-start gap-2">
                          <p className="text-sm text-gray-600 max-w-xs truncate flex-1">
                            {p.description || 'Tidak ada deskripsi'}
                          </p>
                          {p.description && p.description.length > 50 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDescription({ name: p.name, description: p.description || '' });
                                setDescriptionOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto text-xs font-medium"
                            >
                              More
                            </Button>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-bold text-gray-900">Rp {p.price.toLocaleString()}</p>
                          <p className="text-sm text-gray-500 mt-1">Per unit</p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          p.stock < 10 
                            ? 'bg-red-100 text-red-700' 
                            : p.stock < 50 
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {p.stock} units
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {p.size && p.size.length > 0 ? (
                            p.size.slice(0, 3).map((size, idx) => (
                              <span 
                                key={idx} 
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                              >
                                {size}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No sizes</span>
                          )}
                          {p.size && p.size.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              +{p.size.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(p)}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedDelete(p);
                              setDeleteOpen(true);
                            }}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* ADD / EDIT DIALOG */}
      <ProductDialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setSelectedProduct(null);
          setOpen(v);
        }}
        selectedProduct={selectedProduct} // Kirim Product, bukan ProductForm
        onSubmit={selectedProduct ? handleUpdate : handleCreate}
        isSaving={isSaving}
      />

      {/* DELETE CONFIRM */}
      <DeleteProductDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        product={selectedDelete}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />

      {/* DESCRIPTION DIALOG */}
      <DescriptionDialog
        open={descriptionOpen}
        onOpenChange={setDescriptionOpen}
        productName={selectedDescription?.name || ''}
        description={selectedDescription?.description || ''}
      />
    </div>
  );
}