import Link from "next/link"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { createClient } from "@/lib/supabase/server"
import type { Product, Category } from "@/lib/types"
import Image from "next/image"
import { HeroSlideshow } from "@/components/hero-slideshow"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(6)

  // Fetch categories
  const { data: categories } = await supabase.from("categories").select("*").limit(4)

  const { data: slideshowProducts } = await supabase.from("products").select("*").eq("is_active", true).limit(5)

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HeroSlideshow products={slideshowProducts || []} />

        {/* Categories Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
              <p className="text-muted-foreground text-lg">Explore our carefully curated collections</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories?.map((category: Category) => (
                <Link key={category.id} href={`/categories/${category.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative aspect-4/3 overflow-hidden">
                        <Image
                          src={category.image_url || "/placeholder.svg?height=400&width=400"}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex items-end p-6">
                          <div>
                            <h3 className="text-white text-xl font-bold mb-1">{category.name}</h3>
                            <p className="text-white/80 text-sm">{category.description}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
              <p className="text-muted-foreground text-lg">Handpicked items just for you</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {featuredProducts?.map((product: Product) => (
                <Link key={product.id} href={`/products/${product.slug}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.compare_at_price && (
                          <Badge className="absolute top-4 right-4 bg-transparent border border-primary text-primary">Sale</Badge>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-secondary text-secondary" />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">(4.8)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <h6 className="text-xl">${product.price}</h6>
                          {product.compare_at_price && (
                            <h6 className="text-sm text-muted-foreground line-through">
                              ${product.compare_at_price}
                            </h6>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <Link href="/shop">View All Products</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Quality Guaranteed</h3>
                <p className="text-muted-foreground">Premium materials and craftsmanship in every piece</p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
                <p className="text-muted-foreground">Quick shipping on all orders nationwide</p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Secure Payment</h3>
                <p className="text-muted-foreground">Safe and encrypted transactions</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
