import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { IconCircleCheck } from "@tabler/icons-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Categories | LuxeAccessories",
  description: "Browse our product categories",
}

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const params = await searchParams

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <IconCircleCheck className="h-8 w-8" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Thank you for your order. We&apos;ve received your order and will process it shortly.
                </p>

                {params.orderId && (
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm text-muted-foreground mb-1">Order ID</p>
                    <p className="font-mono font-semibold">{params.orderId}</p>
                  </div>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>✓ Order confirmation sent to your email</p>
                  <p>✓ We&apos;ll notify you when your order ships</p>
                  <p>✓ Expected delivery: 3-5 business days</p>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <Button asChild>
                    <Link href="/shop">Continue Shopping</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
