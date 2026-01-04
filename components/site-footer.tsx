"use client"

import Link from "next/link"
import { Icon } from "iconza"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                <img src="/icon.svg" alt="LuxeAccessories Logo" className="h-8 w-8" />
                <h6 className="hidden font-bold text-2xl sm:inline-block text-gray-800 dark:text-gray-100">
                  Luxe
                </h6>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium accessories for the modern lifestyle. Quality and style in every piece.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/watches"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Watches
                </Link>
              </li>
              <li>
                <Link
                  href="/categories/jewelry"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Jewelry
                </Link>
              </li>
              <li>
                <Link href="/categories/bags" className="text-muted-foreground hover:text-foreground transition-colors">
                  Bags
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-foreground transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-foreground transition-colors">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="FacebookRound" size={23} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="Telegram" size={23} />
                <span className="sr-only">Telegram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Icon name="X Dark" size={23} />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} LuxeAccessories. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
