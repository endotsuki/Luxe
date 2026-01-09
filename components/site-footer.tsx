'use client';

import Link from 'next/link';
import { Icon } from 'iconza';

const contact = [
  { icon: 'FacebookRound', label: 'Facebook', href: '#' },
  { icon: 'Telegram', label: 'Telegram', href: '#' },
  { icon: 'X Dark', label: 'Twitter', href: '#' },
];

const support = [
  { link: '/contact', label: 'Contact Us' },
  { link: '/shipping', label: 'Shipping Info' },
  { link: '/returns', label: 'Returns' },
  { link: '/faq', label: 'FAQ' },
];

const shop = [
  { link: '/shop', label: 'All Products' },
  { link: '/categories/watches', label: 'Watches' },
  { link: '/categories/jewelry', label: 'Jewelry' },
  { link: '/categories/bags', label: 'Bags' },
];
export function SiteFooter() {
  return (
    <footer className='border-border bg-muted/50 border-t'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid gap-8 sm:grid-cols-2 md:grid-cols-4'>
          {/* Brand */}
          <div>
            <div className='mb-4 flex items-center gap-2'>
              <div className='flex items-center gap-2'>
                <img src='/icon.png' alt='CCDJewelry Logo' className='h-16 w-16' />
              </div>
            </div>
            <p className='text-muted-foreground text-sm'>Premium accessories for the modern lifestyle. Quality and style in every piece.</p>
          </div>

          {/* Shop */}
          <div>
            <h3 className='mb-4 font-semibold'>Shop</h3>
            <ul className='space-y-2 text-sm'>
              {shop.map((item) => (
                <li key={item.label}>
                  <Link href={item.link} className='text-muted-foreground hover:text-foreground transition-colors'>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className='mb-4 font-semibold'>Support</h3>
            <ul className='space-y-2 text-sm'>
              {support.map((item) => (
                <li key={item.label}>
                  <Link href={item.link} className='text-muted-foreground hover:text-foreground transition-colors'>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className='mb-4 font-semibold'>Connect</h3>
            <div className='flex flex-col gap-4'>
              {contact.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className='text-muted-foreground hover:text-foreground inline-flex items-center gap-3 transition-colors'
                >
                  <Icon name={item.icon} size={23} />
                  <span className='hidden text-sm sm:inline'>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className='border-border text-muted-foreground mt-8 border-t pt-8 text-center text-sm'>
          <p>&copy; {new Date().getFullYear()} CCD Jewelry. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
