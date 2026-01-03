import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { IconArrowLeft, IconAlertCircle, IconCheck } from "@tabler/icons-react"
import OrderActions from "../../../components/order-actions"
import SetRecentOrder from "../../../components/set-recent-order"

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch order with related data
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !order) {
    notFound()
  }

  // Fetch order items
  const { data: items } = await supabase
    .from("order_items")
    .select(
      `
      *,
      product:products(id, name, price, image_url, slug)
    `
    )
    .eq("order_id", id)

  const orderItems = items ?? []

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      approved: "default",
      preparing: "default",
      delivery: "outline",
      completed: "outline",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  const statusSteps = ["pending", "approved", "preparing", "delivery", "completed"]
  const currentStepIndex = statusSteps.indexOf(order.status)

  return (
    <>
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <Link href="/shop">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Shopping
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Order Header */}
          <Card className="py-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order #{order.order_number}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {format(new Date(order.created_at), "MMMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
                <div className="text-right">
                  <h6 className="text-2xl font-bold">${order.total.toFixed(2)}</h6>
                  <div className="mt-2">{getStatusBadge(order.status)}</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <SetRecentOrder orderId={order.id} />

          {/* Order Status Timeline */}
          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-lg">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${index <= currentStepIndex
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {index <= currentStepIndex ? (
                        <IconCheck className="h-5 w-5" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{step.charAt(0).toUpperCase() + step.slice(1)}</p>
                      <p className="text-sm text-muted-foreground">
                        {step === "pending" && "Your order has been received"}
                        {step === "approved" && "Order approved and being prepared"}
                        {step === "preparing" && "Your order is being packed"}
                        {step === "delivery" && "On its way to you"}
                        {step === "completed" && "Order delivered successfully"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-lg">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{order.customer_address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="py-4">
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <p className="text-muted-foreground">No items in this order</p>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Link href={`/products/${item.product?.slug}`} className="text-primary text-base hover:underline">
                              {item.product?.name || "Unknown Product"}
                            </Link>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell><h6>${item.price.toFixed(2)}</h6></TableCell>
                          <TableCell className="text-right font-medium">
                            <h6>${(item.price * item.quantity).toFixed(2)}</h6>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="space-y-2 ml-auto max-w-xs py-4">
                <div className="flex justify-between text-sm">
                  <h6 className="text-muted-foreground">Subtotal</h6>
                  <h6 className="font-medium">${order.total.toFixed(2)}</h6>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <h6>Total</h6>
                  <h6 className="text-primary">${order.total.toFixed(2)}</h6>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/shop">Continue Shopping</Link>
            </Button>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
            <OrderActions orderId={order.id} status={order.status} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
