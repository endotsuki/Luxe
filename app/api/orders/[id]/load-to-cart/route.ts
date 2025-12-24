import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { cart_user_id } = await request.json().catch(() => ({}))
    const orderId = params.id
    const supabase = await createClient()

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId)

    if (itemsError) {
      console.error("Load to cart - fetch items error:", itemsError)
      return NextResponse.json({ error: "Failed to fetch order items" }, { status: 500 })
    }

    const cid = cart_user_id || randomUUID()

    // Insert cart items for the cart user
    const cartInserts = items.map((it: any) => ({
      cart_user_id: cid,
      product_id: it.product_id,
      quantity: it.quantity,
    }))

    const { error: insertError } = await supabase.from("cart_items").insert(cartInserts)

    if (insertError) {
      console.error("Load to cart - insert error:", insertError)
      return NextResponse.json({ error: "Failed to insert cart items" }, { status: 500 })
    }

    return NextResponse.json({ success: true, cart_user_id: cid })
  } catch (error) {
    console.error("Load to cart error:", error)
    return NextResponse.json({ error: "Failed to load order to cart" }, { status: 500 })
  }
}
