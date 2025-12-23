"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrdersTable } from "@/components/orders-table"
import { ProductsTable } from "@/components/products-table"
import type { Order, Product } from "@/lib/types"
import { IconBuildingStore, IconLogout, IconPackage, IconShoppingBag, IconTrendingUp, IconUsers } from "@tabler/icons-react"

interface AdminDashboardProps {
  orders: Order[]
  products: Product[]
  totalOrders: number
  totalProducts: number
}

export function AdminDashboard({ orders, products, totalOrders, totalProducts }: AdminDashboardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const [activeTab, setActiveTab] = useState<"orders" | "products">("orders")
  useEffect(() => {
    const savedTab = localStorage.getItem("admin-active-tab")
    if (savedTab === "orders" || savedTab === "products") {
      setActiveTab(savedTab)
    }
  }, [])

  const handleTabChange = (value: string) => {
    if (value === "orders" || value === "products") {
      setActiveTab(value)
      localStorage.setItem("admin-active-tab", value)
    }
  }

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0)
  const pendingOrders = orders.filter((order) => order.status === "pending").length

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              <img src="/icon.svg" alt="" />
            </div>
            <h1 className="font-bold text-lg">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              disabled={loading}
            >
              <IconBuildingStore className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Store</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loading}
            >
              <IconLogout className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>

        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium"><h6>Total Revenue</h6></CardTitle>
              <IconTrendingUp className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><h6>${totalRevenue.toFixed(2)}</h6></div>
              <p className="text-xs text-muted-foreground">From {totalOrders} orders</p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium"><h6>Total Orders</h6></CardTitle>
              <IconShoppingBag className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><h6>{totalOrders}</h6></div>
              <p className="text-xs text-muted-foreground">{pendingOrders} pending</p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium"><h6>Products</h6></CardTitle>
              <IconPackage className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><h6>{totalProducts}</h6></div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>

          <Card className="py-4">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium"><h6>Customers</h6></CardTitle>
              <IconUsers className="h-6 w-6 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"><h6>{new Set(orders.map((o) => o.customer_email)).size}</h6></div>
              <p className="text-xs text-muted-foreground">Unique customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList>
            <TabsTrigger value="orders" id="tab-orders" aria-controls="tab-orders-content">
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" id="tab-products" aria-controls="tab-products-content">
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <Card className="py-5">
              <CardHeader>
                <CardTitle><h6>Recent Orders</h6></CardTitle>
              </CardHeader>
              <CardContent>
                <OrdersTable orders={orders} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card className="py-5">
              <CardHeader>
                <CardTitle><h6>Products</h6></CardTitle>
              </CardHeader>
              <CardContent>
                <ProductsTable products={products} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
