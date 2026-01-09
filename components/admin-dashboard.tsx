'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrdersTable } from '@/components/orders-table';
import { ProductsTable } from '@/components/products-table';
import { AdminSearch } from '@/components/admin-search';
import type { Order, Product } from '@/lib/types';
import { IconShoppingCart, IconLogout, IconPackage, IconShoppingBag, IconTrendingUp, IconUsers } from '@tabler/icons-react';
import { AnimatedThemeToggler } from '@/components/animated-theme-toggler';
import Lottie from 'lottie-react';

interface AdminDashboardProps {
  orders: Order[];
  products: Product[];
  totalOrders: number;
  totalProducts: number;
}

export function AdminDashboard({ orders, products, totalOrders, totalProducts }: AdminDashboardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const savedTab = localStorage.getItem('admin-active-tab');
    if (savedTab === 'orders' || savedTab === 'products') {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    if (value === 'orders' || value === 'products') {
      setActiveTab(value);
      localStorage.setItem('admin-active-tab', value);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;

  const q = query.trim().toLowerCase();
  const filteredOrders = q
    ? orders.filter((o) =>
        [o.order_number, o.customer_name, o.customer_email, o.customer_phone].some((f) =>
          String(f || '')
            .toLowerCase()
            .includes(q)
        )
      )
    : orders;

  const filteredProducts = q
    ? products.filter((p) =>
        [p.name, p.slug].some((f) =>
          String(f || '')
            .toLowerCase()
            .includes(q)
        )
      )
    : products;

  return (
    <div className='flex min-h-screen flex-col'>
      {/* Header */}
      <header className='border-border bg-background/70 sticky top-0 z-50 w-full border-b py-2 backdrop-blur-sm'>
        <div className='container mx-auto flex items-center justify-between px-4 py-4'>
          <div className='flex items-center gap-2'>
            <img src='/icon.png' className='h-12 w-12' alt='CCD Jewelry' />
            <h1 className='text-lg font-bold'>Admin Dashboard</h1>
            <Button variant='outline' size='sm' onClick={() => router.push('/')} disabled={loading}>
              <IconShoppingCart className='h-4 w-4 sm:mr-1' />
              <span className='hidden sm:inline'>Store</span>
            </Button>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='on-hold' onClick={handleLogout} disabled={loading}>
              <IconLogout className='h-4 w-4 sm:mr-1' />
              <span className='hidden sm:inline'>Logout</span>
            </Button>
            {mounted && <AnimatedThemeToggler />}
          </div>
        </div>
      </header>

      <main className='container mx-auto flex-1 px-4 py-8'>
        {/* Stats */}
        <div className='mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          <Card className='py-4'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
              <IconTrendingUp className='text-muted-foreground h-6 w-6' />
            </CardHeader>
            <CardContent>
              <h6 className='text-2xl font-bold'>${totalRevenue.toFixed(2)}</h6>
              <p className='text-muted-foreground text-xs'>From {totalOrders} orders</p>
            </CardContent>
          </Card>

          <Card className='py-4'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
              <IconShoppingBag className='text-muted-foreground h-6 w-6' />
            </CardHeader>
            <CardContent>
              <h6 className='text-2xl font-bold'>{totalOrders}</h6>
              <p className='text-muted-foreground text-xs'>{pendingOrders} pending</p>
            </CardContent>
          </Card>

          <Card className='py-4'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Products</CardTitle>
              <IconPackage className='text-muted-foreground h-6 w-6' />
            </CardHeader>
            <CardContent>
              <h6 className='text-2xl font-bold'>{totalProducts}</h6>
              <p className='text-muted-foreground text-xs'>Active listings</p>
            </CardContent>
          </Card>

          <Card className='py-4'>
            <CardHeader className='flex flex-row items-center justify-between pb-2'>
              <CardTitle className='text-sm font-medium'>Customers</CardTitle>
              <IconUsers className='text-muted-foreground h-6 w-6' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                <h6>{new Set(orders.map((o) => o.customer_email)).size}</h6>
              </div>
              <p className='text-muted-foreground text-xs'>Unique customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
          <TabsList className='bg-muted/50 mb-6'>
            <TabsTrigger
              value='orders'
              id='tab-orders'
              aria-controls='tab-orders-content'
              className='data-[state=active]:bg-background data-[state=active]:shadow-sm'
            >
              Orders
            </TabsTrigger>
            <TabsTrigger
              value='products'
              id='tab-products'
              aria-controls='tab-products-content'
              className='data-[state=active]:bg-background data-[state=active]:shadow-sm'
            >
              Products
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <AdminSearch onSearch={(val) => setQuery(val)} placeholder='Search by order number, customer, product...' />

          <TabsContent value='orders' className='mt-6'>
            <Card className='py-5'>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <OrdersTable orders={filteredOrders} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='products' className='mt-6'>
            <Card className='py-5'>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductsTable products={filteredProducts} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
