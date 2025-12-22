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
  product: Product & { category?: { name: string; slug: string } }
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { toast } = useToast()
  const router = useRouter()

  const images = [product.image_url, ...product.additional_images].filter(Boolean)
  const [isShareOpen, setIsShareOpen] = useState(false)

  // get full URL for the product page
  const productUrl = typeof window !== "undefined"
    ? window.location.href
    : `${product.slug}` // fallback if SSR

  const handleAddToCart = async () => {
    try {
      const userId = localStorage.getItem("cart_user_id") || crypto.randomUUID()
      localStorage.setItem("cart_user_id", userId)

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          quantity,
        }),
      })

      if (!res.ok) throw new Error()

      toast({
        title: "Added to cart",
        description: `${product.name} is now in your cart.`,
      })

      router.refresh()
    } catch {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      })
    }
  }

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
                  src={images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-5 gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`relative aspect-square rounded-lg overflow-hidden border transition
                  ${selectedImage === i ? "border-primary" : "border-transparent hover:border-border"}
                `}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-8 lg:sticky lg:top-24">
          <div>
            {product.compare_at_price && (
              <Badge className="mb-3 bg-secondary text-secondary-foreground">
                Limited Offer
              </Badge>
            )}

            <h1 className="text-4xl font-bold tracking-tight mb-2">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 text-sm mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    className="h-5 w-5 fill-secondary text-secondary"
                  />
                ))}
              </div>
              <span className="text-muted-foreground">(4.8 · 127 reviews)</span>
            </div>

            <div className="flex items-end gap-4">
              <span className="text-4xl font-bold">${product.price}</span>
              {product.compare_at_price && (
                <span className="text-lg text-muted-foreground line-through">
                  ${product.compare_at_price}
                </span>
              )}
            </div>
          </div>

          <Separator />

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <Separator />

          {/* Quantity */}
          <div>
            <p className="text-sm font-medium mb-2">Quantity</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  <IconMinus className="h-4 w-4" />
                </Button>
                <span className="px-4 min-w-10 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                >
                  <IconPlus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              size="lg"
              variant={"outline"}
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
            <Button size="lg" variant="outline" onClick={() => setIsShareOpen(true)}>
              <IconShare className="h-5 w-5" />
            </Button>
            <ShareModal url={productUrl} open={isShareOpen} onOpenChange={setIsShareOpen} />
          </div>

          {/* Info Card */}
          <Card className="glass">
            <CardContent className="p-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-medium">{product.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{product.category?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Availability</span>
                <span className={product.stock > 0 ? "text-green-600" : "text-destructive"}>
                  {product.stock > 0 ? "In stock" : "Out of stock"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
