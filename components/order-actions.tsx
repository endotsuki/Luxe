"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter()
  const { toast } = useToast()

  const loadToCart = async () => {
    try {
      const cartUserId = localStorage.getItem("cart_user_id")
      const res = await fetch(`/api/orders/${orderId}/load-to-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart_user_id: cartUserId }),
      })
      if (!res.ok) throw new Error("Failed to load to cart")
      const data = await res.json()
      if (data.cart_user_id) localStorage.setItem("cart_user_id", data.cart_user_id)
      router.push("/cart")
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to load order to cart", variant: "destructive" })
    }
  }

  const cancelOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to cancel")
      toast({
        title: "Order cancelled",
        description: "You can undo this action within 10 seconds.",
        action: (
          <button
            onClick={async () => {
              try {
                await fetch(`/api/orders/${orderId}/restore`, { method: "POST" })
                toast({ title: "Restored", description: "Order has been restored." })
              } catch (e) {
                console.error(e)
                toast({ title: "Error", description: "Failed to restore order", variant: "destructive" })
              }
            }}
            className="underline"
          >
            Undo
          </button>
        ),
      })
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "Failed to cancel order", variant: "destructive" })
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={loadToCart} variant="outline">
        Load to Cart
      </Button>
      {status !== "cancelled" && (
        <Button onClick={cancelOrder} variant="destructive">
          Cancel Order
        </Button>
      )}
    </div>
  )
}
