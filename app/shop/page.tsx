import { Metadata } from "next"
import { Suspense } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductGrid } from "@/components/product-grid"
import { ProductFilters } from "@/components/product-filters"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Shop All Products | LuxeAccessories",
  description: "Browse our complete collection of premium accessories",
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>
}) {
  const params = await searchParams

  return (
    <>
      <SiteHeader />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Shop All Products</h1>
            <p className="text-muted-foreground">Discover our complete collection</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-64 md:sticky md:top-28 self-start">
              <ProductFilters />
            </aside>

            <div className="flex-1">
              <Suspense fallback={<ProductGridSkeleton />}>
                <ProductGrid category={params.category} sort={params.sort} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
