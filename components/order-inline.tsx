"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function OrderInline({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`)
        if (!res.ok) throw new Error("Order not found")
        const data = await res.json()
        if (!mounted) return
        setOrder(data.order)
        setItems(data.items || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
    return () => {
      mounted = false
    }
  }, [orderId])

  if (loading) return <div>Loading recent order…</div>
  if (!order) return null

  const subtotal = items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0)

  const markComplete = async () => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, status: "completed" }),
      })
      if (!res.ok) throw new Error("Failed to update")
      // remove recent order id so it disappears
      localStorage.removeItem("recent_order_id")
      setOrder(null)
      setItems([])
      toast({ title: "Order completed", description: "The order was marked as completed." })
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: "Failed to complete order", variant: "destructive" })
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Order #{order.order_number}</CardTitle>
          <div className="text-right font-bold">${order.total.toFixed(2)}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="rounded-md border">
            <ul className="divide-y">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 p-3">
                  <div className="h-16 w-16 relative rounded overflow-hidden bg-muted">
                    {it.product?.image_url ? (
                      <Image src={it.product.image_url} alt={it.product?.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{it.product?.name || it.product_name}</div>
                    <div className="text-sm text-muted-foreground">{it.quantity} × ${it.price.toFixed(2)}</div>
                  </div>
                  <div className="font-medium">${(it.price * it.quantity).toFixed(2)}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">Subtotal</div>
            <div className="font-bold">${subtotal.toFixed(2)}</div>
          </div>

          <div className="flex gap-2">
            <Button onClick={markComplete} variant="destructive">
              Mark Complete
            </Button>
            <Button onClick={() => { localStorage.removeItem("recent_order_id"); setOrder(null); setItems([]) }} variant="outline">
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
