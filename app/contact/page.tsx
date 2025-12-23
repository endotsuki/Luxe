"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import type { CartItem } from "@/lib/types"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { IconMail, IconMessage2, IconPhone, IconSend, IconShoppingBag, IconUser } from "@tabler/icons-react"

export default function ContactPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderMode, setOrderMode] = useState(false)
  const [showCartOption, setShowCartOption] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    message: "",
  })

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
      if (data.length > 0) {
        setOrderMode(true)
      }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (orderMode && cartItems.length > 0) {
        // Order submission with cart items
        const userId = localStorage.getItem("cart_user_id")
        const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

        const response = await fetch("/api/contact-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            customer: formData,
            total,
            items: cartItems.map((item) => ({
              product_name: item.product?.name || "",
              quantity: item.quantity,
              price: item.product?.price || 0,
            })),
          }),
        })

        if (!response.ok) throw new Error("Failed to send order")

        toast({
          title: "Order sent successfully!",
          description: "We'll contact you shortly to confirm your order.",
        })

        // Clear cart and form
        localStorage.removeItem("cart_user_id")
        setCartItems([])
        setFormData({ name: "", contact: "", email: "", message: "" })
        setOrderMode(false)

        router.push("/")
      } else {
        // Regular contact form submission
        const response = await fetch("/api/contact-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
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

  const total = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)

  if (loading) {
    return (
      <main className="min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">Loading...</div>
      </main>
    )
  }

  return (
    // SiteHeader
    <main className="min-h-screen">
      <SiteHeader cartCount={cartItems.length} />
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-primary/10 via-background to-accent/10 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              {orderMode ? "Complete Your Order" : "Contact Us"}
            </h1>
            <p className="text-lg text-muted-foreground text-pretty">
              {orderMode
                ? "Review your cart and provide your contact information to place your order"
                : "Have a question or need assistance? We're here to help!"}
            </p>
          </div>
        </div>
      </section>

      {/* Contact/Order Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {showCartOption && (
              <div className="flex gap-4 mb-8 justify-center flex-wrap">
                {cartItems.length > 0 ? (
                  <>
                    <Button variant={orderMode ? "default" : "outline"} onClick={() => setOrderMode(true)}>
                      <IconShoppingBag className="w-4 h-4 mr-2" />
                      Place Order ({cartItems.length} items)
                    </Button>
                    <Button variant={!orderMode ? "default" : "outline"} onClick={() => setOrderMode(false)}>
                      <IconSend className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={loadCartItems} disabled={loading}>
                      <IconShoppingBag className="w-4 h-4 mr-2" />
                      {loading ? "Loading Cart..." : "Load Cart to Order"}
                    </Button>
                    <Button variant="default" onClick={() => setOrderMode(false)}>
                      <IconSend className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </>
                )}
              </div>
            )}

            {orderMode && cartItems.length > 0 ? (
              <div className="grid lg:grid-cols-5 gap-8">
                {/* Cart Items with Detailed Pricing */}
                <div className="lg:col-span-3 space-y-6">
                  <Card className="border-2 border-primary/20">
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <IconShoppingBag className="w-6 h-6 text-primary" />
                        Order Summary
                      </h2>

                      {/* Product List with Detailed Pricing */}
                      <div className="space-y-4">
                        {cartItems.map((item, index) => (
                          <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted shrink-0 border">
                              <Image
                                src={item.product?.image_url || "/placeholder.svg"}
                                alt={item.product?.name || "Product"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <h3 className="font-semibold text-lg">
                                  {index + 1}. {item.product?.name}
                                </h3>
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-muted-foreground">Unit Price</p>
                                  <h6 className="font-semibold">${(item.product?.price || 0).toFixed(2)}</h6>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Quantity: <span className="font-medium text-foreground">{item.quantity}</span>
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">Subtotal</p>
                                  <h6 className="text-xl font-bold text-primary">
                                    ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                                  </h6>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-6" />

                      {/* Order Total Breakdown */}
                      <div className="space-y-3 bg-muted/50 rounded-lg p-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Items Total</span>
                          <h6 className="font-medium">{cartItems.length} item(s)</h6>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <h6 className="font-medium">${total.toFixed(2)}</h6>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-2xl font-bold">
                          <h6>Total Amount</h6>
                          <h6 className="text-primary">${total.toFixed(2)}</h6>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Note:</strong> Need to make changes?{" "}
                          <a href="/cart" className="text-primary hover:underline font-medium">
                            Edit your cart
                          </a>{" "}
                          before placing your order.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <Card className="sticky top-20">
                    <CardContent className="p-6">
                      <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                            <IconUser className="w-4 h-4" />
                            <h6>Full Name *</h6> 
                          </label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            required
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="contact" className="text-sm font-semibold flex items-center gap-2">
                            <IconPhone className="w-4 h-4" />
                            <h6>Phone or Telegram *</h6>
                          </label>
                          <Input
                            id="contact"
                            name="contact"
                            placeholder="+1234567890 or @username"
                            required
                            value={formData.contact}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                            <IconMail className="w-4 h-4" />
                            <h6>Email (Optional)</h6>
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="message" className="text-sm font-semibold flex items-center gap-2">
                            <IconMessage2 className="w-4 h-4" />
                            <h6>Message (Optional)</h6>
                          </label>
                          <Textarea
                            id="message"
                            name="message"
                            placeholder="Any special requests or delivery notes..."
                            rows={4}
                            value={formData.message}
                            onChange={handleChange}
                          />
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                          {submitting ? "Sending Order..." : "Place Order"}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                          * Required fields. We'll contact you to confirm your order and arrange delivery.
                        </p>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              // Regular contact form
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                          <IconUser className="w-4 h-4" />
                          <h6>Full Name *</h6>
                        </label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          required
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="contact" className="text-sm font-semibold flex items-center gap-2">
                          <IconPhone className="w-4 h-4" />
                          <h6>Phone or Telegram *</h6>
                        </label>
                        <Input
                          id="contact"
                          name="contact"
                          placeholder="+1234567890 or @username"
                          required
                          value={formData.contact}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                          <IconMail className="w-4 h-4" />
                          <h6>Email (Optional)</h6>
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-semibold flex items-center gap-2">
                          <IconMessage2 className="w-4 h-4" />
                          <h6>Message *</h6>
                        </label>
                        <Textarea
                          id="message"
                          name="message"
                          placeholder="How can we help you?"
                          rows={6}
                          required
                          value={formData.message}
                          onChange={handleChange}
                        />
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                        {submitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <div className="mt-8 grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <IconMail className="w-8 h-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-semibold mb-2">Email</h3>
                      <p className="text-sm text-muted-foreground">contact@luxe.com</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <IconPhone className="w-8 h-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-semibold mb-2">Phone</h3>
                      <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <IconMessage2 className="w-8 h-8 mx-auto mb-3 text-primary" />
                      <h3 className="font-semibold mb-2">Telegram</h3>
                      <p className="text-sm text-muted-foreground">@LuxeAccessories</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
