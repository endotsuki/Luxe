import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = await createClient()

    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", id).single()
    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const { data: items } = await supabase
      .from("order_items")
      .select(`*, product:products(id, name, price, image_url, slug)`)
      .eq("order_id", id)

    return NextResponse.json({ order, items: items ?? [] })
  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
