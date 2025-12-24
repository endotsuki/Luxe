import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    const supabase = await createClient()

    const { error } = await supabase.from("orders").update({ status: "cancelled", cancelled_at: new Date() }).eq("id", orderId)

    if (error) {
      console.error("Cancel order error:", error)
      return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancel order exception:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
