"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import {
  IconHeart,
  IconMinus,
  IconPlus,
  IconShare,
  IconShoppingCart,
  IconStar,
} from "@tabler/icons-react"
import { ShareModal } from "./ShareModal"

interface ProductDetailsProps {
  product: Product & { category?: { name: string; slug: string } };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const images = [product.image_url, ...product.additional_images];

  const handleAddToCart = async () => {
    try {
      // Generate a user ID from browser fingerprint
      const userId =
        localStorage.getItem("cart_user_id") || crypto.randomUUID();
      localStorage.setItem("cart_user_id", userId);

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          quantity,
        }),
      });

      // if (!response.ok) throw new Error("Failed to add to cart");

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/categories/${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={
                    images[selectedImage]
                      ? `/images/${images[selectedImage]}`
                      : "/placeholder.svg"
                  }
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-8 lg:sticky lg:top-24">
          <div>
            {product.compare_at_price && (
              <Badge className="mb-2 bg-secondary text-secondary-foreground">
                Sale
              </Badge>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <IconStar
                      key={i}
                      className="h-5 w-5 fill-secondary text-secondary"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  (4.8 / 127 reviews)
                </span>
              </div>
              <span className="text-muted-foreground">(4.8 · 127 reviews)</span>
            </div>

            <div className="flex items-end gap-4">
              <span className="text-4xl font-bold">${product.price}</span>
              {product.compare_at_price && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.compare_at_price}
                </span>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <IconMinus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={quantity >= product.stock}
                  >
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>
          </div>

            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <IconShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <IconHeart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <IconShare className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">SKU:</span>
                <span className="font-medium">
                  {product.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium">
                  {product.category?.name || "Uncategorized"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Availability:</span>
                <span
                  className={`font-medium ${
                    product.stock > 0 ? "text-green-600" : "text-destructive"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
