'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { SearchBar } from './SearchBar';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { IconShoppingCart, IconSmartHome, IconCategory2, IconMessage, IconMenuDeep, IconPackage } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { AnimatedThemeToggler } from './animated-theme-toggler';
import { useCartData } from '@/hooks/useCartData';

interface SiteHeaderProps {
  cartCount?: number;
}

export function SiteHeader({ cartCount = 0 }: SiteHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [recentOrderId, setRecentOrderId] = useState<string | null>(null);

  // If parent doesn't provide cartCount, read from client cart hook
  const { cartItems } = useCartData();
  const displayCartCount = typeof cartCount === 'number' && cartCount > 0 ? cartCount : cartItems?.length || 0;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    try {
      const rid = localStorage.getItem('recent_order_id');
      if (rid) setRecentOrderId(rid);
    } catch {}
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: IconSmartHome },
    { name: 'Shop', href: '/shop', icon: IconShoppingCart },
    { name: 'Categories', href: '/categories', icon: IconCategory2 },
    { name: 'Contact', href: '/contact', icon: IconMessage },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/50 shadow-lg shadow-black/5 backdrop-blur-md dark:bg-gray-900/50' : 'bg-white/80 dark:bg-transparent'
      } md:inset-x-4 md:top-4 md:rounded-2xl lg:inset-x-20 xl:inset-x-40`}
    >
      <div className='container mx-auto px-4 sm:px-6'>
        <div className='flex h-16 items-center justify-between gap-4 md:h-20'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-2'>
            <img src='/icon.png' alt='CCD Logo' className='h-14 w-14' />
          </Link>

          {/* Desktop Nav */}
          <nav className='hidden items-center gap-8 lg:flex xl:gap-12'>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className='text-foreground/70 hover:text-foreground group relative text-sm font-medium transition-colors dark:text-gray-300 dark:hover:text-white'
              >
                <p className='flex items-center gap-1.5 text-base'>
                  <item.icon className='h-5 w-5' />
                  {item.name}
                </p>
                {pathname === item.href && (
                  <motion.div
                    layoutId='active-nav'
                    className='bg-primary absolute inset-x-0 -bottom-1 h-0.5 rounded-full'
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className='flex items-center gap-1 sm:gap-2'>
            {/* Search - Hidden on mobile */}
            <div className='hidden lg:block'>
              <SearchBar />
            </div>

            {/* Theme Toggle */}
            {mounted && <AnimatedThemeToggler />}

            {/* Recent Order */}
            {mounted && recentOrderId && (
              <Button
                variant='ghost'
                size='icon'
                onClick={() => router.push(`/orders/${recentOrderId}`)}
                className='relative hidden h-9 w-9 sm:flex'
              >
                <IconPackage className='h-5 w-5' />
                <span className='absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-blue-500' />
              </Button>
            )}

            {/* Cart */}
            <Link href='/cart'>
              <Button variant='ghost' size='icon' className='relative h-9 w-9'>
                <IconShoppingCart className='h-5 w-5' />
                {displayCartCount > 0 && (
                  <Badge className='absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 p-0 text-xs'>
                    {displayCartCount > 9 ? '9+' : displayCartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className='lg:hidden'>
                <Button variant='ghost' size='icon' className='h-9 w-9 rounded-full'>
                  <IconMenuDeep className='h-5 w-5' />
                </Button>
              </SheetTrigger>
              <SheetContent side='right' className='w-72 p-6 sm:w-[320px]'>
                <VisuallyHidden>
                  <SheetTitle>Menu</SheetTitle>
                </VisuallyHidden>

                {/* Mobile Search */}
                <div className='mt-6 mb-8 lg:hidden'>
                  <SearchBar />
                </div>

                <nav className='flex flex-col gap-4'>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 py-2 text-base font-medium transition-colors ${
                        pathname === item.href ? 'text-primary' : 'text-foreground/70 hover:text-primary dark:text-gray-200'
                      }`}
                    >
                      <item.icon className='h-5 w-5' />
                      {item.name}
                    </Link>
                  ))}

                  {/* Mobile Recent Order Link */}
                  {recentOrderId && (
                    <Link
                      href={`/orders/${recentOrderId}`}
                      className='text-foreground/70 hover:text-primary flex items-center gap-3 py-2 text-base font-medium transition-colors sm:hidden dark:text-gray-200'
                    >
                      <IconPackage className='h-5 w-5' />
                      Recent Order
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
