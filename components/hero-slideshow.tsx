"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { IconArrowRight, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import { sizedImage } from "@/lib/utils"

interface HeroSlideshowProps {
  products: Product[]
}

export function HeroSlideshow({ products }: HeroSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Debug: Log products to verify unique slugs
  useEffect(() => {
    if (products.length > 0) {
      console.log("Hero slideshow products:", products.map((p: any) => ({ name: p.name, slug: p.slug })))
    }
  }, [products])

  const defaultSlides = [
    {
      id: "slide-1",
      name: "Luxury Watches Collection",
      description: "Timeless elegance meets modern craftsmanship in our curated watch collection",
      price: "299",
      image_url: "/luxury-watch-elegant.jpg",
      slug: "shop",
    },
    {
      id: "slide-2",
      name: "Designer Jewelry",
      description: "Stunning pieces that add sparkle to every occasion",
      price: "199",
      image_url: "/elegant-jewelry-necklace.jpg",
      slug: "shop",
    },
    {
      id: "slide-3",
      name: "Premium Bags",
      description: "Carry your style with our exclusive bag collection",
      price: "349",
      image_url: "/leather-designer-bag.jpg",
      slug: "shop",
    },
  ]

  const displayProducts = products.length > 0 ? products : (defaultSlides as any)

  useEffect(() => {
    if (displayProducts.length === 0) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayProducts.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [displayProducts.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + displayProducts.length) % displayProducts.length)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % displayProducts.length)
  }

  if (displayProducts.length === 0) {
    return (
      <section className="relative h-150 bg-linear-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to LuxeAccessories</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Discover our premium collection of accessories
            </p>
            <Button size="lg" asChild>
              <Link href="/shop">
                Shop Now <IconArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  const currentProduct = displayProducts[currentSlide]

  return (
    <section className="relative h-150 md:h-175 overflow-hidden bg-background">
      {/* Slideshow Container */}
      <div className="relative h-full">
        {displayProducts.map((product: any, index: number) => (
          <div
            key={product.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <Image
                src={
                  product.image_url
                    ? sizedImage(product.image_url, 1080)
                    : "/placeholder.svg"
                }
                alt={product.name}
                fill
                style={{ objectFit: "cover" }}
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative h-full container mx-auto px-4">
              <div className="flex h-full items-center">
                <div className="max-w-2xl text-white">
                  <Badge className="mb-4 bg-secondary text-secondary-foreground">
                    {product.compare_at_price ? "Special Offer" : "New Arrival"}
                  </Badge>
                  <h2 className="text-4xl md:text-6xl font-bold mb-4 text-balance">{product.name}</h2>
                  <p className="text-lg md:text-xl mb-6 text-white/90 text-pretty max-w-xl">{product.description}</p>
                  <div className="flex items-baseline gap-3 mb-8">
                    <h6 className="text-4xl md:text-5xl font-bold">${product.price}</h6>
                    {product.compare_at_price && (
                      <h6 className="text-xl text-white/60 line-through">${product.compare_at_price}</h6>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button size="lg" asChild className="bg-white text-black hover:bg-white/90">
                      <Link 
                        href={`/products/${product.slug}`}
                        onClick={() => console.log(`Clicked: ${product.name} (${product.slug}) - currentSlide: ${currentSlide}`)}
                      >
                        View Details <IconArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                      className="border-white text-white hover:bg-white/10 bg-transparent"
                    >
                      <Link href="/shop">Browse Collection</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-all"
        aria-label="Previous slide"
      >
        <IconChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-all"
        aria-label="Next slide"
      >
        <IconChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {displayProducts.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/75"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
