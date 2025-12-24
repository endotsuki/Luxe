import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { format } from "date-fns"
import { IconArrowLeft } from "@tabler/icons-react"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
  const { data: items = [] } = await supabase
    .from("order_items")
    .select(
      `
      *,
      product:products(id, name, price, image_url, slug)
    `
    )
    .eq("order_id", id)

  const itemsList = items ?? []

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      requested: "secondary",
      approved: "default",
      preparing: "default",
      delivery: "outline",
      completed: "outline",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin">
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Order #{order.order_number}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {format(new Date(order.created_at), "MMMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${order.total.toFixed(2)}</div>
                  <div className="mt-2">{getStatusBadge(order.status)}</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
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
              {order.customer_notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium bg-muted p-3 rounded-md">{order.customer_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {itemsList.length === 0 ? (
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
                      {itemsList.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Link href={`/products/${item.product?.slug}`} className="text-primary hover:underline">
                              {item.product?.name || "Unknown Product"}
                            </Link>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2 ml-auto max-w-xs">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${order.total.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
