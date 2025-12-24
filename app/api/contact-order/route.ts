import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { customer, total, items, isOrder } = await request.json()

    if (isOrder) {
      // Save order to database
      const supabase = await createClient()

      // Generate order number
      const orderNumber = `ORD-${Date.now()}`

      // Insert order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          customer_name: customer.name,
          customer_email: customer.email || "",
          customer_phone: customer.contact,
          customer_telegram: customer.contact,
          customer_address: "",
          subtotal: total,
          total: total,
          status: "requested",
          notes: customer.message || "",
          telegram_sent: false,
        })
        .select()
        .single()

      if (orderError) {
        console.error("[v0] Order creation error:", orderError)
        return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
      }

      // Insert order items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.product_name,
        product_image: item.image_url,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) {
        console.error("[v0] Order items error:", itemsError)
        return NextResponse.json({ error: "Failed to create order items" }, { status: 500 })
      }

      // Send Telegram notification to admin
      try {
        await sendTelegramNotification(customer, items, total, orderNumber)

        // Update order to mark telegram sent
        await supabase.from("orders").update({ telegram_sent: true }).eq("id", order.id)
      } catch (telegramError) {
        console.error("[v0] Telegram notification failed:", telegramError)
      }

      return NextResponse.json({ success: true, orderId: order.id, orderNumber })
    } else {
      // Send contact message to Telegram
      try {
        await sendContactMessage(customer)
        return NextResponse.json({ success: true })
      } catch (error) {
        console.error("[v0] Contact message failed:", error)
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
      }
    }
  } catch (error) {
    console.error("[v0] Contact order error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

async function sendTelegramNotification(customer: any, items: any[], total: number, orderNumber: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    throw new Error("Telegram credentials not configured")
  }

  const productsList = items
    .map((item, index) => {
      const itemTotal = item.price * item.quantity
      return `${index + 1}. ${item.product_name} x${item.quantity} – $${itemTotal.toFixed(0)}`
    })
    .join("\n")

  const message = `🛒 NEW ORDER

📋 Order: ${orderNumber}
👤 Name: ${customer.name}
📞 Contact: ${customer.contact}
📧 Email: ${customer.email || "-"}
${customer.message ? `💬 Message: ${customer.message}\n` : ""}
📦 Products:
${productsList}

💰 Total: $${total.toFixed(0)}`

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`)
  }

  return response.json()
}

async function sendContactMessage(customer: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    throw new Error("Telegram credentials not configured")
  }

  const message = `💬 NEW CONTACT MESSAGE

👤 Name: ${customer.name}
📞 Contact: ${customer.contact}
📧 Email: ${customer.email || "-"}
💬 Message: ${customer.message || "No message"}`

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`)
  }

  return response.json()
}
