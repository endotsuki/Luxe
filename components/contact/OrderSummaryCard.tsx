import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { IconShoppingBag } from '@tabler/icons-react';
import type { CartItem } from '@/lib/types';
import { sizedImage } from '@/lib/utils';

interface OrderSummaryCardProps {
  cartItems: CartItem[];
  total: number;
}

export function OrderSummaryCard({ cartItems, total }: OrderSummaryCardProps) {
  return (
    <Card className='border-primary/20 border-2'>
      <CardContent className='p-6'>
        <h2 className='mb-6 flex items-center gap-2 text-2xl font-bold'>
          <IconShoppingBag stroke={1.5} className='text-primary h-8 w-8' />
          Order Summary
        </h2>

        <div className='space-y-4'>
          {cartItems.map((item, index) => (
            <div key={item.id} className='flex gap-4 border-b pb-4 last:border-0 last:pb-0'>
              <div className='bg-muted relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border'>
                <Image
                  src={item.product?.image_url ? sizedImage(item.product.image_url, 400) : '/placeholder.svg'}
                  alt={item.product?.name || 'Product'}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className='min-w-0 flex-1'>
                <div className='mb-2 flex items-start justify-between gap-2'>
                  <h3 className='text-lg font-semibold'>
                    {index + 1}. {item.product?.name}
                  </h3>
                  <div className='shrink-0 text-right'>
                    <p className='text-muted-foreground text-xs'>Unit Price</p>
                    <h6 className='font-semibold'>${(item.product?.price || 0).toFixed(2)}</h6>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-muted-foreground text-sm'>
                      Quantity: <span className='text-foreground font-medium'>{item.quantity}</span>
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='text-muted-foreground text-xs'>Subtotal</p>
                    <h6 className='text-primary text-xl font-bold'>${((item.product?.price || 0) * item.quantity).toFixed(2)}</h6>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className='my-6' />

        <div className='bg-muted/50 space-y-3 rounded-lg p-4'>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Items Total</span>
            <h6 className='font-medium'>{cartItems.length} item(s)</h6>
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-muted-foreground'>Subtotal</span>
            <h6 className='font-medium'>${total.toFixed(2)}</h6>
          </div>
          <Separator />
          <div className='flex justify-between text-2xl font-bold'>
            <h6>Total Amount</h6>
            <h6 className='text-primary'>${total.toFixed(2)}</h6>
          </div>
        </div>

        <div className='bg-accent/10 mt-6 rounded-lg p-4'>
          <p className='text-muted-foreground text-sm'>
            <strong>Note:</strong> Need to make changes?{' '}
            <a href='/cart' className='text-primary font-medium hover:underline'>
              Edit your cart
            </a>{' '}
            before placing your order.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
