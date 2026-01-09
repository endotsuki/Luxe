'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { CartItem } from '@/lib/types';
import { sizedImage } from '@/lib/utils';
import { IconArrowRight, IconTrash } from '@tabler/icons-react';
import { QuantitySelector } from './QuantitySelector';

export function CartContent() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const userId = localStorage.getItem('cart_user_id');
      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/cart?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch cart');

      const data = await response.json();
      setCartItems(data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    // Update state immediately
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));

    // Then update server in background
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, quantity }),
      });
      if (!response.ok) throw new Error('Failed to update quantity');
      // notify other listeners (header, other tabs) that cart changed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
        try {
          localStorage.setItem('cart-last-updated', String(Date.now()));
        } catch {}
      }
    } catch (error) {
      console.error(error);
      // optionally revert or show toast
    }
  };

  const removeItem = async (id: string) => {
    try {
      const response = await fetch(`/api/cart?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove item');

      fetchCart();
      // notify other listeners (header, other tabs) that cart changed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cart-updated'));
        try {
          localStorage.setItem('cart-last-updated', String(Date.now()));
        } catch {}
      }
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your cart',
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (loading) {
    return <div className='py-12 text-center'>Loading...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className='py-12 text-center'>
        <p className='text-muted-foreground mb-4 text-xl'>Your cart is empty</p>
        <Button asChild>
          <Link href='/shop'>Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='grid gap-8 lg:grid-cols-3'>
      <div className='space-y-4 lg:col-span-2'>
        {cartItems.map((item) => (
          <Card key={item.id}>
            <CardContent className='p-6'>
              <div className='flex gap-4'>
                <div className='relative h-24 w-24 shrink-0 overflow-hidden rounded-lg'>
                  <Image
                    src={item.product?.image_url ? sizedImage(item.product.image_url, 400) : '/placeholder.svg'}
                    alt={item.product?.name || ''}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className='flex-1'>
                  <div className='flex justify-between'>
                    <div>
                      <Link href={`/products/${item.product?.slug}`}>
                        <h3 className='hover:text-primary font-semibold transition-colors hover:underline'>{item.product?.name}</h3>
                      </Link>
                      <h6 className='text-muted-foreground mt-1 text-sm'>${item.product?.price}</h6>
                    </div>
                    <Button variant='destructive' size='icon' onClick={() => removeItem(item.id)}>
                      <IconTrash className='h-5 w-5' />
                    </Button>
                  </div>
                  <div className='mt-4 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <QuantitySelector
                        quantity={item.quantity}
                        onQuantityChange={(newQuantity) => updateQuantity(item.id, newQuantity)}
                        stock={item.product?.stock || 0}
                        showLabel={false}
                        showStock={false}
                      />
                      <h6 className='font-semibold'>${((item.product?.price || 0) * item.quantity).toFixed(2)}</h6>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Card className='sticky top-28'>
          <CardContent className='p-6'>
            <h2 className='mb-4 text-xl font-bold'>Order Summary</h2>

            <div className='mb-4 space-y-2'>
              <div className='flex justify-between text-sm'>
                <h6 className='text-muted-foreground'>Subtotal</h6>
                <h6 className='font-medium'>${subtotal.toFixed(2)}</h6>
              </div>
            </div>
            <Separator className='my-4' />
            <div className='mb-6 flex justify-between text-lg font-bold'>
              <h6>Total</h6>
              <h6>${subtotal.toFixed(2)}</h6>
            </div>
            <div className='flex gap-3'>
              <Button variant='todo' className='flex-1' asChild>
                <Link href='/contact' className='flex items-center justify-center'>
                  Place Order <IconArrowRight className='h-5 w-5' />
                </Link>
              </Button>

              <Button variant='archived' className='flex-1' asChild>
                <Link href='/shop' className='flex items-center justify-center'>
                  Continue Shopping
                </Link>
              </Button>
            </div>
            <p className='text-muted-foreground mt-4 text-center text-xs'>You can remove items from your cart before placing an order</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
