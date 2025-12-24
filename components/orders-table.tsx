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

  const statusBg: Record<string, string> = {
    requested: "bg-gray-100 dark:bg-linear-to-tl from-gray-500/10 to-gray-500/50",
    approved: "bg-green-100 dark:bg-linear-to-tl from-green-500/10 to-green-500/50",
    preparing: "bg-yellow-100 dark:bg-linear-to-tl from-yellow-500/10 to-yellow-500/50",
    delivery: "bg-blue-100 dark:bg-linear-to-tl from-blue-500/10 to-blue-500/50",
    completed: "bg-emerald-100 dark:bg-linear-to-tl from-emerald-500/10 to-emerald-500/50",
    cancelled: "bg-red-100 dark:bg-linear-to-tl from-red-500/10 to-red-500/50",
  }
  if (orders.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No orders yet</div>
  }

  return (
    <div className="rounded-md border p-5">
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
              <TableCell><h6>${order.total.toFixed(2)}</h6></TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onValueChange={(value) => updateOrderStatus(order.id, value)}
                  disabled={updating === order.id}
                >
                  <SelectTrigger
                    className={`w-36 capitalize transition-colors text-white hover:text-secondary border border-primary/50 ${statusBg[order.status]}`}
                  >
                    <SelectValue />
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
              <TableCell>
                {format(new Date(order.created_at), "MMM dd, yyyy • hh:mm a").toUpperCase()}
              </TableCell>
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
