import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"

interface ProductGridProps {
  category?: string
  sort?: string
  limit?: number
}

export async function ProductGrid({ category, sort, limit }: ProductGridProps) {
  const supabase = await createClient()

  let query = supabase.from("products").select("*").eq("is_active", true)

  if (category) {
    const { data: categoryData } = await supabase.from("categories").select("id").eq("slug", category).single()
    if (categoryData) {
      query = query.eq("category_id", categoryData.id)
    }
  }

  // Apply sorting
  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "name":
      query = query.order("name", { ascending: true })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data: products } = await query

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product: Product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
