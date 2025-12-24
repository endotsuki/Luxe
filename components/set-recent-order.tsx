"use client"

import { useEffect } from "react"

export default function SetRecentOrder({ orderId }: { orderId: string }) {
  useEffect(() => {
    try {
      if (orderId) localStorage.setItem("recent_order_id", orderId)
    } catch (e) {}
  }, [orderId])

  return null
}
