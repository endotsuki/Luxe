"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import {
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { sizedImage } from "@/lib/utils";

interface HeroSlideshowProps {
  products: Product[];
}

// Separate component for each slide to prevent closure issues
function Slide({ product, isActive }: { product: any; isActive: boolean }) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-1000 ${
        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
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
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      <div className="relative h-full container mx-auto px-4 flex items-center">
        <div className="max-w-2xl text-white">
          <Badge className="mb-4 bg-secondary text-secondary-foreground">
            {product.compare_at_price ? "Special Offer" : "New Arrival"}
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            {product.name}
          </h2>
          <p className="text-lg md:text-xl mb-6 text-white/90 max-w-xl">
            {product.description}
          </p>
          <div className="flex items-baseline gap-3 mb-8">
            <h6 className="text-4xl md:text-5xl font-bold">${product.price}</h6>
            {product.compare_at_price && (
              <h6 className="text-xl text-white/60 line-through">
                ${product.compare_at_price}
              </h6>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="on-hold" asChild size="lg">
              <Link href={`/products/${product.slug}`}>
                View Details <IconArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/shop">Browse Collection</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSlideshow({ products }: HeroSlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (products.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [products.length]);

  if (products.length === 0) {
    return (
      <section className="relative h-150 bg-linear-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to CCD Jewelry
            </h1>
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
    );
  }

  return (
    <section className="relative h-150 md:h-175 overflow-hidden bg-background">
      {/* Slides */}
      <div className="relative h-full">
        {products.map((product: any, index: number) => (
          <Slide
            key={product.id}
            product={product}
            isActive={index === currentSlide}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() =>
          setCurrentSlide(
            (prev) => (prev - 1 + products.length) % products.length
          )
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-all"
        aria-label="Previous slide"
      >
        <IconChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % products.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-full transition-all"
        aria-label="Next slide"
      >
        <IconChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {products.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
