"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { sizedImage } from "@/lib/utils";

interface ProductRowProps {
  title: string;
  products: Product[] | null;
}

export function ProductRow({ title, products }: ProductRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products?.length) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.offsetWidth / 2;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-12 relative">
      <div className="container mx-auto px-4 relative">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">{title}</h2>

        {/* Scroll Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1 p-2 bg-white/10 backdrop-blur-sm rounded-full shadow z-10 hover:bg-gray-100/20"
        >
          <IconChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1 p-2 bg-white/10 backdrop-blur-sm rounded-full shadow z-10 hover:bg-gray-100/20"
        >
          <IconChevronRight className="h-6 w-6" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="min-w-56"
            >
              <Card className="group overflow-hidden hover:shadow-lg transition-all">
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={
                        product.image_url
                          ? sizedImage(product.image_url, 400)
                          : "/placeholder.svg"
                      }
                      alt={product.name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="group-hover:scale-105 transition-transform"
                    />
                    {product.compare_at_price &&
                      Number(product.compare_at_price) >
                        Number(product.price) && (
                        <Badge className="absolute top-3 right-3 bg-primary">
                          -
                          {Math.round(
                            ((Number(product.compare_at_price) -
                              Number(product.price)) /
                              Number(product.compare_at_price)) *
                              100
                          )}
                          %
                        </Badge>
                      )}
                  </div>

                  <div className="p-3">
                    <h3 className="font-medium truncate">{product.name}</h3>

                    {product.compare_at_price &&
                    Number(product.compare_at_price) > Number(product.price) ? (
                      <div className="flex items-center gap-3">
                        <h6 className="text-sm font-semibold text-foreground">
                          ${Number(product.price).toFixed(2)}
                        </h6>
                        <h6 className="text-sm text-muted-foreground line-through">
                          ${Number(product.compare_at_price).toFixed(2)}
                        </h6>
                      </div>
                    ) : (
                      <h6 className="text-sm text-muted-foreground">
                        ${Number(product.price).toFixed(2)}
                      </h6>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
