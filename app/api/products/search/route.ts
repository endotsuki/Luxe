import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""

    if (!query) {
      return NextResponse.json([], { status: 200 })
    }

    // Search products by name, only active products
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, image_url")
      .ilike("name", `%${query}%`)
      .eq("is_active", true)
      .limit(10)

    if (error) {
      console.error("Supabase search error:", error)
      return NextResponse.json([], { status: 500 })
    }

    const results = data.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image_url,
      href: `/products/${p.slug}`,
    }))

    return NextResponse.json(results)
  } catch (err) {
    console.error("Search route error:", err)
    return NextResponse.json([], { status: 500 })
  }
}
