import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { IconStar } from "@tabler/icons-react"

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discountPercent = product.compare_at_price &&
    Number(product.compare_at_price) > Number(product.price)
    ? Math.round(
      ((Number(product.compare_at_price) - Number(product.price)) /
        Number(product.compare_at_price)) * 100
    )
    : 0;
  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={
                product.image_url
                  ? `/images/${encodeURIComponent(product.image_url)}`
                  : "/placeholder.svg"
              }
              alt={product.name}
              fill
              objectFit="cover"
              className="group-hover:scale-105 transition-transform duration-300"
            />

            {discountPercent > 0 && (
              <Badge className="absolute top-4 right-4 bg-primary">
                -{discountPercent}%
              </Badge>
            )}
          </div>
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <IconStar
                    key={i}
                    className="h-4 w-4 fill-secondary text-secondary"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.8)</span>
            </div>
            <div className="flex items-center gap-2">
              <h6 className="text-2xl font-bold">${Number(product.price).toFixed(2)}</h6>
              {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) && (
                <span className="text-sm text-muted-foreground line-through">
                  ${Number(product.compare_at_price).toFixed(2)}
                </span>
              )}
            </div>
            {product.stock < 10 && product.stock > 0 && (
              <p className="text-sm text-destructive mt-2">
                Only {product.stock} left!
              </p>
            )}
            {product.stock === 0 && (
              <p className="text-sm text-muted-foreground mt-2">Out of stock</p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
