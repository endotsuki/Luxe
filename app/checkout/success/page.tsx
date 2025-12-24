import { redirect } from "next/navigation"

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string; orderNumber?: string }> }) {
  const params = await searchParams

  // Redirect to order tracking page if orderId is provided
  if (params.orderId) {
    redirect(`/orders/${params.orderId}`)
  }

  // Fallback if no orderId (shouldn't happen in normal flow)
  redirect("/shop")
}
