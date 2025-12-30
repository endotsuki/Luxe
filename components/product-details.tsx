"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Product } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { IconHeart, IconMinus, IconPlus, IconShare, IconShoppingCart, IconChevronLeft, IconChevronRight, IconStar } from "@tabler/icons-react"
import { ShareModal } from "./ShareModal"
import { ProductRow } from "@/components/ProductRow"
import { sizedImage } from "@/lib/utils"

interface ProductDetailsProps {
  product: Product & { category?: { name: string; id: string; slug: string } }
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [shareOpen, setShareOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const thumbsRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const images = [product.image_url, ...(product.additional_images || [])]

  useEffect(() => {
    if (typeof window !== "undefined") setCurrentUrl(window.location.href)
  }, [])

  useEffect(() => {
    if (!product.category) return
    fetch(`/api/products?category=${product.category.id}&exclude=${product.id}&limit=10`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(setRelatedProducts)
      .catch(err => console.error("Failed to fetch related products:", err))
  }, [product])

  const handleAddToCart = async () => {
    try {
      const userId = localStorage.getItem("cart_user_id") || crypto.randomUUID()
      localStorage.setItem("cart_user_id", userId)
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: product.id, quantity }),
      })
      toast({ title: "Added to cart", description: `${product.name} has been added to your cart.` })
      router.refresh()
    } catch {
      toast({ title: "Error", description: "Failed to add item to cart.", variant: "destructive" })
    }
  }

  const scroll = (dir: number) => thumbsRef.current?.scrollBy({ left: dir * 120, behavior: 'smooth' })

  return (
    <div className="container mx-auto px-4 py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 md:mb-8 text-xs sm:text-sm text-muted-foreground flex flex-wrap gap-1">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-foreground">Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link>
          </>
        )}
        <span>/</span>
        <span className="truncate max-w-36 sm:max-w-none">{product.name}</span>
      </nav>

      <div className="grid gap-6 md:gap-8 lg:gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-3 md:space-y-4">
          <Card className="overflow-hidden shadow-lg rounded-3xl">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={images[selectedImage] ? sizedImage(images[selectedImage], 1080) : "/placeholder.svg"}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover rounded-xl"
                />
                {product.compare_at_price && (
                  <Badge className="absolute top-3 left-3 bg-black text-white border-0 text-xs px-2 py-1">
                    {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {images.length > 1 && (
            <div className="relative">
              <button
                onClick={() => scroll(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2 bg-background/80 hover:bg-background rounded-full shadow hidden sm:block"
                aria-label="Scroll left"
              >
                <IconChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
              </button>

              <div
                ref={thumbsRef}
                className="flex gap-2 md:gap-4 overflow-x-auto py-2 px-2 scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative min-w-28 w-16 aspect-square rounded-3xl overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-primary' : 'border-transparent hover:border-border'}`}
                  >
                    <Image src={img ? sizedImage(img, 400) : "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => scroll(1)}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-1.5 md:p-2 bg-background/80 hover:bg-background rounded-full shadow hidden sm:block"
                aria-label="Scroll right"
              >
                <IconChevronRight className="h-3 w-3 md:h-4 md:w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4 md:space-y-6 lg:space-y-8 lg:sticky lg:top-24">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>

            {/* Compact Rating */}
            <div className="flex items-center gap-2 text-sm mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <IconStar key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-muted-foreground">4.8 (127)</span>
            </div>

            <div className="flex items-end gap-2 md:gap-4">
              <h6 className="text-3xl md:text-4xl font-bold">${product.price}</h6>
              {product.compare_at_price && <h6 className="text-lg md:text-xl text-muted-foreground line-through">${product.compare_at_price}</h6>}
            </div>
          </div>

          <Separator />
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{product.description}</p>
          <Separator />

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <div className="flex items-center border border-border rounded-lg px-0.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                    <IconMinus className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                  <span className="px-3 md:px-4 py-2 min-w-10 md:min-w-12 text-center text-sm md:text-base">{quantity}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}>
                    <IconPlus className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 md:gap-4">
            <Button size="lg" className="h-10 md:h-11 flex-1 sm:flex-none sm:w-auto text-sm md:text-base" onClick={handleAddToCart} disabled={product.stock === 0}>
              <IconShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
              Add to Cart
            </Button>
            <Button size="lg" className="h-10 w-10 md:h-11 md:w-11" variant="outline">
              <IconHeart className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button variant="outline" className="h-10 w-10 md:h-11 md:w-11" size="lg" onClick={() => setShareOpen(true)}>
              <IconShare className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <ShareModal url={currentUrl} open={shareOpen} onOpenChange={setShareOpen} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-8 md:mt-12">
          <ProductRow title="Related Products" products={relatedProducts} />
        </div>
      )}
    </div>
  )
}