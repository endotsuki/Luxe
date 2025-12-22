"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import type { CartItem } from "@/lib/types"
import { IconArrowNarrowRight, IconMinus, IconPlus, IconTrash } from "@tabler/icons-react"

export function CartContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const userId = localStorage.getItem("cart_user_id")
      if (!userId) {
        setLoading(false)
        return
      }

      const response = await fetch(`/api/cart?user_id=${userId}`)
      if (!response.ok) throw new Error("Failed to fetch cart")

      const data = await response.json()
      setCartItems(data)
    } catch (error) {
      console.error("Failed to fetch cart:", error)
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity }),
      })

      if (!response.ok) throw new Error("Failed to update quantity")

      fetchCart()
    } catch (error) {
      console.error("Failed to update quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const removeItem = async (id: string) => {
    try {
      const response = await fetch(`/api/cart?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to remove item")

      fetchCart()
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      })
    } catch (error) {
      console.error("Failed to remove item:", error)
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      })
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground mb-4">Your cart is empty</p>
        <Button asChild>
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {cartItems.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={item.product?.image_url || ""}
                    alt={item.product?.name || ""}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <Link href={`/products/${item.product?.slug}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors">{item.product?.name}</h3>
                      </Link>
                      <h6 className="text-sm text-muted-foreground mt-1">${item.product?.price}</h6>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => removeItem(item.id)}>
                      <IconTrash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <IconMinus className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 min-w-12 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.product?.stock || 0)}
                      >
                        <IconPlus className="h-4 w-4" />
                      </Button>
                    </div>
                    <h6 className="font-semibold">${((item.product?.price || 0) * item.quantity).toFixed(2)}</h6>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Card className="sticky top-20">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <h6 className="font-medium">${subtotal.toFixed(2)}</h6>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <h6>${subtotal.toFixed(2)}</h6>
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" size="lg" asChild>
                <Link href="/contact" className="flex items-center justify-center">
                  Place Order <IconArrowNarrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button variant="outline" className="flex-1" size="lg" asChild>
                <Link href="/shop" className="flex items-center justify-center">
                  Continue Shopping
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              You can remove items from your cart before placing an order
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
