'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/lib/types';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { sizedImage } from '@/lib/utils';

interface ProductRowProps {
  title: string;
  products: Product[] | null;
}

export function ProductRow({ title, products }: ProductRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products?.length) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.offsetWidth / 2;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className='relative py-12'>
      <div className='relative container mx-auto px-4'>
        <h2 className='mb-6 text-2xl font-bold md:text-3xl'>{title}</h2>

        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          className='absolute top-1/2 left-0 z-10 -translate-x-1 -translate-y-1/2 rounded-full bg-white/10 p-2 shadow backdrop-blur-sm hover:bg-gray-100/20'
        >
          <IconChevronLeft className='h-6 w-6' />
        </button>

        <button
          onClick={() => scroll('right')}
          className='absolute top-1/2 right-0 z-10 translate-x-1 -translate-y-1/2 rounded-full bg-white/10 p-2 shadow backdrop-blur-sm hover:bg-gray-100/20'
        >
          <IconChevronRight className='h-6 w-6' />
        </button>

        <div ref={scrollRef} className='scrollbar-hide flex gap-4 overflow-x-auto pb-4'>
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className='min-w-56'>
              <Card className='group overflow-hidden transition-all hover:shadow-lg'>
                <CardContent className='p-0'>
                  <div className='relative aspect-square overflow-hidden'>
                    <Image
                      src={product.image_url ? sizedImage(product.image_url, 400) : '/placeholder.svg'}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className='transition-transform group-hover:scale-105'
                    />
                    {product.compare_at_price && (
                      <Badge variant='discount' className='absolute top-3 left-3'>
                        {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                      </Badge>
                    )}
                  </div>

                  <div className='p-3'>
                    <h3 className='truncate font-medium'>{product.name}</h3>

                    {product.compare_at_price && Number(product.compare_at_price) > Number(product.price) ? (
                      <div className='flex items-center gap-3'>
                        <h6 className='text-foreground text-sm font-semibold'>${Number(product.price).toFixed(2)}</h6>
                        <h6 className='text-muted-foreground text-sm line-through'>${Number(product.compare_at_price).toFixed(2)}</h6>
                      </div>
                    ) : (
                      <h6 className='text-muted-foreground text-sm'>${Number(product.price).toFixed(2)}</h6>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
