import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    const supabase = await createClient()

    // Restore to requested status
    const { error } = await supabase.from("orders").update({ status: "requested", cancelled_at: null }).eq("id", orderId)

    if (error) {
      console.error("Restore order error:", error)
      return NextResponse.json({ error: "Failed to restore order" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Restore order exception:", error)
    return NextResponse.json({ error: "Failed to restore order" }, { status: 500 })
  }
}
