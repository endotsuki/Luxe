"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ProductDialog } from "@/components/product-dialog";
import type { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import { sizedImage } from "@/lib/utils";
import { IconArrowUpRight, IconPencil, IconCategoryPlus, IconTrash } from "@tabler/icons-react";
import { IconPhoto } from "@tabler/icons-react";

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [slideshowIds, setSlideshowIds] = useState<Record<string, boolean>>({});

  const itemsPerPage = 10;
  const sortedProducts = [...products].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsPreviewMode(false);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsPreviewMode(false);
    setIsDialogOpen(true);
  };

  const handlePreviewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsPreviewMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setDeleteConfirmOpen(true);
    }
  };

  // Load slideshow membership to show toggle state
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/admin/slideshow`);
        if (!res.ok) {
          const err = await res.text().catch(() => null);
          console.error("Failed loading slideshow membership:", res.status, err);
          return;
        }
        const json = await res.json();
        const ids = (json.products || []).map((p: any) => p.id);
        if (mounted) {
          const map: Record<string, boolean> = {};
          ids.forEach((id: string) => (map[id] = true));
          setSlideshowIds(map);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const addToSlideshow = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/slideshow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setSlideshowIds((s) => ({ ...s, [productId]: true }));
      } else {
        const body = await res.json().catch(() => null);
        console.error("Add to slideshow failed:", res.status, body);
        alert(body?.error || body?.message || "Failed to add to slideshow");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to add to slideshow");
    }
  };

  const removeFromSlideshow = async (productId: string) => {
    try {
      const res = await fetch(`/api/admin/slideshow?productId=${encodeURIComponent(productId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSlideshowIds((s) => {
          const copy = { ...s };
          delete copy[productId];
          return copy;
        });
      } else {
        const body = await res.json().catch(() => null);
        console.error("Remove from slideshow failed:", res.status, body);
        alert(body?.error || body?.message || "Failed to remove from slideshow");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to remove from slideshow");
    }
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(productToDelete.id);
    setDeleteConfirmOpen(false);
    
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    } finally {
      setIsDeleting(null);
      setProductToDelete(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedProduct(null);
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddProduct}>
          <IconCategoryPlus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No products yet. Click "Add Product" to create your first product.
        </div>
      ) : (
        <div className="rounded-md border p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><h6>Product</h6></TableHead>
                <TableHead><h6>Price</h6></TableHead>
                <TableHead><h6>Stock</h6></TableHead>
                <TableHead><h6>Status</h6></TableHead>
                <TableHead className="text-right"><h6>Actions</h6></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div 
                        className="flex items-center gap-3 cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => handlePreviewProduct(product)}
                      >
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                          <Image
                            src={
                              product.image_url
                                ? sizedImage(product.image_url, 48)
                                : "/placeholder.svg"
                            }
                            alt={product.name}
                            fill
                            sizes="32"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <div className="flex-1">
                          <h6 className="font-medium">{product.name}</h6>
                          <div className="text-xs text-muted-foreground">
                            {product.slug}
                          </div>
                          {product.additional_images && product.additional_images.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              +{product.additional_images.length} more image{product.additional_images.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <h6 className="font-medium">${product.price}</h6>
                        {product.compare_at_price && (
                          <h6 className="text-sm text-muted-foreground line-through">
                            ${product.compare_at_price}
                          </h6>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.stock > 10
                            ? "outline"
                            : product.stock > 0
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {product.stock} units
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.is_active ? "outline" : "secondary"}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" className="w-9 h-9">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                          >
                            <IconArrowUpRight stroke={1.5} className="h-5 w-5" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="w-9 h-9"
                        >
                          <IconPencil stroke={1.5} className="h-5 w-5" />
                        </Button>
                        <Button
                          variant={slideshowIds[product.id] ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (slideshowIds[product.id]) removeFromSlideshow(product.id);
                            else addToSlideshow(product.id);
                          }}
                          className="w-9 h-9"
                          aria-label={slideshowIds[product.id] ? "Remove from slideshow" : "Add to slideshow"}
                        >
                          <IconPhoto stroke={1.5} className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isDeleting === product.id}
                          className="w-9 h-9"
                        >
                          <IconTrash stroke={1.5} className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
            </p>
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </div>
      )}

      <ProductDialog
        product={selectedProduct}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        isPreviewMode={isPreviewMode}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting === productToDelete?.id}
            >
              {isDeleting === productToDelete?.id ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
