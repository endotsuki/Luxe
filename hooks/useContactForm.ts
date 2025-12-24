import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { CartItem } from "@/lib/types"

export function useContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (
    e: React.FormEvent,
    orderMode: boolean,
    cartItems: CartItem[],
    onSuccess: () => void
  ) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (orderMode && cartItems.length > 0) {
        const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

        const cartUserId = localStorage.getItem("cart_user_id")
        const response = await fetch("/api/contact-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: formData,
            total,
            items: cartItems.map((item) => ({
              id: item.product?.id,
              product_name: item.product?.name || "",
              quantity: item.quantity,
              price: item.product?.price || 0,
              image_url: item.product?.image_url || "",
            })),
            isOrder: true,
            cart_user_id: cartUserId,
          }),
        })

        if (!response.ok) throw new Error("Failed to send order")

        const data = await response.json()

        toast({
          title: "Order placed successfully!",
          description: "Redirecting to your order details...",
        })
        // keep cart_user_id so users can reload or reuse the cart; order page offers "Load to Cart"
        try {
          if (data?.orderId) {
            localStorage.setItem("recent_order_id", data.orderId)
          }
        } catch (e) {
          // ignore
        }
        setFormData({ name: "", contact: "", email: "", message: "" })
        onSuccess()
        // Redirect to order tracking page
        router.push(`/orders/${data.orderId}`)
      } else {
        const response = await fetch("/api/contact-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer: formData,
            isOrder: false,
          }),
        })

        if (!response.ok) throw new Error("Failed to send message")

        toast({
          title: "Message sent successfully!",
          description: "We'll get back to you as soon as possible.",
        })

        setFormData({ name: "", contact: "", email: "", message: "" })
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast({
        title: "Error",
        description: orderMode
          ? "Failed to send order. Please try again."
          : "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return {
    formData,
    submitting,
    handleChange,
    handleSubmit,
  }
}