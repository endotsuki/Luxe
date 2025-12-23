"use client";

import { useState } from "react";
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
import { ProductDialog } from "@/components/product-dialog";
import type { Product } from "@/lib/types";
import { useRouter } from "next/navigation";
import { IconEdit, IconExternalLink, IconPlus, IconTrash } from "@tabler/icons-react";

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(productId);
    try {
      const response = await fetch(`/api/products/${productId}`, {
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
    }
  };

  const handleDialogClose = (shouldRefresh: boolean) => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
    if (shouldRefresh) {
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAddProduct}>
          <IconPlus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No products yet. Click "Add Product" to create your first product.
        </div>
      ) : (
        <div className="rounded-md border">
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
              {[...products]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-md overflow-hidden">
                          <Image
                            src={
                              product.image_url
                                ? `/images/${product.image_url}`
                                : "/placeholder.svg"
                            }
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h6 className="font-medium">{product.name}</h6>
                          <div className="text-sm text-muted-foreground">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">${product.price}</div>
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
                      <div className="flex items-center justify-end">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                          >
                            <IconExternalLink stroke={1.5} className="h-5 w-5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <IconEdit stroke={1.5} className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isDeleting === product.id}
                        >
                          <IconTrash stroke={1.5} className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductDialog
        product={selectedProduct}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />
    </div>
  );
}
