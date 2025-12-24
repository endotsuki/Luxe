"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Order } from "@/lib/types"
import { IconExternalLink } from "@tabler/icons-react"

interface OrdersTableProps {
  orders: Order[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [updating, setUpdating] = useState<string | null>(null)

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdating(orderId)
    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      })

      if (!response.ok) throw new Error("Failed to update order")

      toast({
        title: "Success",
        description: "Order status updated. Customer will be notified via Telegram.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
      requested: { variant: "secondary", color: "bg-yellow-500" },
      approved: { variant: "default", color: "bg-green-500" },
      preparing: { variant: "default", color: "bg-blue-500" },
      delivery: { variant: "outline", color: "bg-purple-500" },
      completed: { variant: "outline", color: "bg-green-600" },
      cancelled: { variant: "destructive", color: "bg-red-500" },
    }

    const config = variants[status] || { variant: "default" as const, color: "" }
    return <Badge variant={config.variant}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
  }

  if (orders.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No orders yet</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{order.customer_name}</div>
                  <div className="text-muted-foreground">{order.customer_phone}</div>
                </div>
              </TableCell>
              <TableCell>${order.total.toFixed(2)}</TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onValueChange={(value) => updateOrderStatus(order.id, value)}
                  disabled={updating === order.id}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue>{getStatusBadge(order.status)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested">📋 Requested</SelectItem>
                    <SelectItem value="approved">✅ Approved</SelectItem>
                    <SelectItem value="preparing">📦 Preparing</SelectItem>
                    <SelectItem value="delivery">🚚 Delivery</SelectItem>
                    <SelectItem value="completed">🎉 Completed</SelectItem>
                    <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{format(new Date(order.created_at), "MMM dd, yyyy")}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/admin/orders/${order.id}`}>
                    <IconExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
