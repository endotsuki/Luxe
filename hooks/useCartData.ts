import { useState, useEffect } from "react"
import type { CartItem } from "@/lib/types"

export function useCartData() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  const loadCartItems = async () => {
    setLoading(true)
    await fetchCart()
    setLoading(false)
  }

  const clearCart = () => {
    setCartItems([])
  }

  useEffect(() => {
    fetchCart()

    // Listen for custom events so other components can notify when cart changes
    const onCartUpdated = () => {
      fetchCart()
    }
    try {
      window.addEventListener("cart-updated", onCartUpdated as EventListener)
      // also listen to storage events (other tabs) for safety
      const onStorage = (e: StorageEvent) => {
        if (e.key === "cart_user_id") fetchCart()
      }
      window.addEventListener("storage", onStorage)

      return () => {
        window.removeEventListener("cart-updated", onCartUpdated as EventListener)
        window.removeEventListener("storage", onStorage)
      }
    } catch {
      // If window is not available (SSR), ignore
      return
    }
  }, [])

  return {
    cartItems,
    loading,
    loadCartItems,
    clearCart,
  }
}