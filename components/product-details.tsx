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
import { IconHeart, IconMinus, IconPlus, IconShare, IconShoppingCart, IconStar, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { ShareModal } from "./ShareModal"
import { ProductRow } from "@/components/ProductRow"

interface ProductDetailsProps {
  product: Product & { category?: { name: string; id: string; slug: string } }
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { toast } = useToast()
  const router = useRouter()
  const [shareOpen, setShareOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const thumbsRef = useRef<HTMLDivElement>(null)

  const images = [product.image_url, ...(product.additional_images || [])]

  useEffect(() => {
    if (typeof window !== "undefined") setCurrentUrl(window.location.href)
  }, [])

  // Fetch related products
  useEffect(() => {
    async function fetchRelated() {
      if (!product.category) return
      try {
        const res = await fetch(`/api/products?category=${product.category.id}&exclude=${product.id}&limit=10`)
        if (!res.ok) throw new Error("Failed to fetch related products")
        const data = await res.json()
        setRelatedProducts(data)
      } catch (error) {
        console.error("Failed to fetch related products:", error)
      }
    }
    fetchRelated()
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
    } catch (error) {
      toast({ title: "Error", description: "Failed to add item to cart.", variant: "destructive" })
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link> /
        <Link href="/shop" className="hover:text-foreground">Shop</Link> /
        {product.category && (
          <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground">
            {product.category.name}
          </Link>
        )} / {product.name}
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Card className="overflow-hidden h-2xl w-2xl shadow-lg rounded-4xl">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={images[selectedImage] ? `/images/${encodeURIComponent(images[selectedImage])}` : "/placeholder.svg"}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover rounded-4xl"
                />
              </div>
            </CardContent>
          </Card>

          {images.length > 1 && (
            <div className="relative">
              <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20 hidden sm:block">
                <button
                  type="button"
                  onClick={() => thumbsRef.current?.scrollBy({ left: -120, behavior: 'smooth' })}
                  className="p-2 bg-background/80 hover:bg-background rounded-full shadow"
                  aria-label="Scroll left"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </button>
              </div>

              <div
                ref={thumbsRef}
                className="flex gap-4 overflow-x-auto overflow-y-hidden py-2 px-2 no-scrollbar scrollbar-hide"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative min-w-28 w-16 aspect-square rounded-3xl overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-primary' : 'border-transparent hover:border-border'}`}
                  >
                    <Image
                      src={img ? `/images/${encodeURIComponent(img)}` : "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </button>
                ))}
              </div>

              <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20 hidden sm:block">
                <button
                  type="button"
                  onClick={() => thumbsRef.current?.scrollBy({ left: 120, behavior: 'smooth' })}
                  className="p-2 bg-background/80 hover:bg-background rounded-full shadow"
                  aria-label="Scroll right"
                >
                  <IconChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-8 lg:sticky lg:top-24">
          <div>
            {product.compare_at_price && <Badge className="mb-2 bg-secondary text-secondary-foreground">Sale</Badge>}
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex">{[...Array(5)].map((_, i) => <IconStar key={i} className="h-5 w-5 fill-secondary text-secondary" />)}</div>
                <span className="text-sm text-muted-foreground">(4.8 / 127 reviews)</span>
              </div>
            </div>

            <div className="flex items-end gap-4">
              <h6 className="text-4xl font-bold">${product.price}</h6>
              {product.compare_at_price && <h6 className="text-xl text-muted-foreground line-through">${product.compare_at_price}</h6>}
            </div>
          </div>

          <Separator />
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          <Separator />

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-lg px-0.5">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}><IconMinus className="h-4 w-4" /></Button>
                  <span className="px-4 py-2 min-w-12 text-center">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={quantity >= product.stock}><IconPlus className="h-4 w-4" /></Button>
                </div>
                <span className="text-sm text-muted-foreground">{product.stock > 0 ? `${product.stock} available` : "Out of stock"}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button size="lg" className="h-11 w-auto" onClick={handleAddToCart} disabled={product.stock === 0}><IconShoppingCart className="h-5 w-5" />Add to Cart</Button>
            <Button size="lg" className="h-11 w-11" variant="outline"><IconHeart className="h-5 w-5" /></Button>
            <Button variant="outline" className="h-11 w-11" size="lg" onClick={() => setShareOpen(true)}><IconShare className="h-5 w-5" /></Button>
            <ShareModal url={currentUrl} open={shareOpen} onOpenChange={setShareOpen} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <ProductRow title="Related Products" products={relatedProducts} />
        </div>
      )}
    </div>
  )
}
