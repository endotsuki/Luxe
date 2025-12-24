import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest) {
  try {
    const { orderId, status } = await request.json()

    const supabase = await createClient()

    // Update order status
    const { data, error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single()

    if (error) throw error

    // No Telegram notification on status update - will be handled separately for customer notifications

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Order update error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
