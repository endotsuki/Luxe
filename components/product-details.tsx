'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { IconHeart, IconShare, IconShoppingCart, IconChevronLeft, IconChevronRight, IconStar } from '@tabler/icons-react';
import { ShareModal } from './ShareModal';
import { ProductRow } from '@/components/ProductRow';
import { sizedImage } from '@/lib/utils';
import { QuantitySelector } from './QuantitySelector';

interface ProductDetailsProps {
  product: Product & { category?: { name: string; id: string; slug: string } };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const images = [product.image_url, ...(product.additional_images || [])];

  useEffect(() => {
    if (typeof window !== 'undefined') setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (!product.category) return;
    fetch(`/api/products?category=${product.category.id}&exclude=${product.id}&limit=10`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setRelatedProducts)
      .catch((err) => console.error('Failed to fetch related products:', err));
  }, [product]);

  const handleAddToCart = async () => {
    try {
      const userId = localStorage.getItem('cart_user_id') || crypto.randomUUID();
      localStorage.setItem('cart_user_id', userId);
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          product_id: product.id,
          quantity,
        }),
      });
      toast({
        title: 'Added to cart',
        description: `${product.name} has been added to your cart.`,
      });
      // notify other components (header) to refresh cart immediately
      try {
        window.dispatchEvent(new CustomEvent('cart-updated'));
      } catch {
        // ignore if window not available
      }
      // keep the router refresh optional; header will update via event
      // router.refresh()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart.',
        variant: 'destructive',
      });
    }
  };

  const scroll = (dir: number) => thumbsRef.current?.scrollBy({ left: dir * 120, behavior: 'smooth' });

  return (
    <div className='container mx-auto px-4 py-6 md:py-10'>
      {/* Breadcrumb */}
      <nav className='text-muted-foreground mb-6 flex flex-wrap gap-1 text-xs sm:text-sm md:mb-8'>
        <Link href='/' className='hover:text-foreground'>
          Home
        </Link>
        <span>/</span>
        <Link href='/shop' className='hover:text-foreground'>
          Shop
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/categories/${product.category.slug}`} className='hover:text-foreground'>
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className='max-w-36 truncate sm:max-w-none'>{product.name}</span>
      </nav>

      <div className='grid gap-6 md:gap-8 lg:grid-cols-2 lg:gap-12'>
        {/* Image Gallery */}
        <div className='space-y-3 md:space-y-4'>
          <Card className='overflow-hidden rounded-3xl shadow-lg'>
            <CardContent className='p-0'>
              <div className='bg-muted relative aspect-square'>
                <Image
                  src={images[selectedImage] ? sizedImage(images[selectedImage], 1080) : '/placeholder.svg'}
                  alt={product.name}
                  fill
                  priority
                  className='rounded-xl object-cover'
                />
                {product.compare_at_price && (
                  <Badge className='absolute top-3 left-3 border-0 bg-black px-2 py-1 text-xs text-white'>
                    {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {images.length > 1 && (
            <div className='relative'>
              <button
                onClick={() => scroll(-1)}
                className='bg-background/80 hover:bg-background absolute top-1/2 left-1 z-20 hidden -translate-y-1/2 rounded-full p-1.5 shadow sm:block md:p-2'
                aria-label='Scroll left'
              >
                <IconChevronLeft className='h-3 w-3 md:h-4 md:w-4' />
              </button>

              <div
                ref={thumbsRef}
                className='scrollbar-hide flex gap-2 overflow-x-auto py-2 md:gap-4'
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square w-16 min-w-28 overflow-hidden rounded-3xl border-3 transition-colors ${
                      selectedImage === i ? 'border-primary/60' : 'hover:border-border border-transparent'
                    }`}
                  >
                    <Image src={img ? sizedImage(img, 400) : '/placeholder.svg'} alt={product.name} fill className='object-cover' />
                  </button>
                ))}
              </div>

              <button
                onClick={() => scroll(1)}
                className='bg-background/80 hover:bg-background absolute top-1/2 right-1 z-20 hidden -translate-y-1/2 rounded-full p-1.5 shadow sm:block md:p-2'
                aria-label='Scroll right'
              >
                <IconChevronRight className='h-3 w-3 md:h-4 md:w-4' />
              </button>
            </div>
          )}
        </div>

        {/* Details */}
        <div className='space-y-4 md:space-y-6 lg:space-y-8'>
          <div>
            <h1 className='mb-2 text-2xl font-bold sm:text-3xl md:text-4xl'>{product.name}</h1>

            {/* Compact Rating */}
            <div className='mb-3 flex items-center gap-2 text-sm'>
              <div className='flex'>
                {[...Array(5)].map((_, i) => (
                  <IconStar key={i} className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                ))}
              </div>
              <span className='text-muted-foreground'>4.8 (127)</span>
            </div>

            <div className='flex items-end gap-2 md:gap-4'>
              <h6 className='text-3xl font-bold md:text-4xl'>${product.price}</h6>
              {product.compare_at_price && (
                <h6 className='text-muted-foreground text-lg line-through md:text-xl'>${product.compare_at_price}</h6>
              )}
            </div>
          </div>

          <Separator />
          <p className='text-muted-foreground text-sm leading-relaxed md:text-base'>{product.description}</p>
          <Separator />

          {/* Quantity & Actions */}
          <QuantitySelector quantity={quantity} onQuantityChange={setQuantity} stock={product.stock} />

          <div className='flex flex-wrap gap-3 md:gap-4'>
            <Button variant='on-hold' onClick={handleAddToCart} disabled={product.stock === 0} className='h-12'>
              <IconShoppingCart stroke={1.5} />
              Add to Cart
            </Button>

            <Button size='icon' variant='blocked' className='h-12 w-12'>
              <IconHeart stroke={1.5} />
            </Button>

            <Button variant='todo' size='icon' className='h-12 w-12' onClick={() => setShareOpen(true)}>
              <IconShare stroke={1.5} />
            </Button>

            <ShareModal url={currentUrl} open={shareOpen} onOpenChange={setShareOpen} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className='mt-8 md:mt-12'>
          <ProductRow title='Related Products' products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
