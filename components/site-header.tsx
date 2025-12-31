"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { SearchBar } from "./SearchBar"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { IconShoppingCart, IconHome, IconCategory2, IconMessage, IconMenuDeep, IconPackage } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { AnimatedThemeToggler } from "./animated-theme-toggler"
import { useCartData } from "@/hooks/useCartData"

interface SiteHeaderProps {
  cartCount?: number
}

export function SiteHeader({ cartCount = 0 }: SiteHeaderProps) {
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [recentOrderId, setRecentOrderId] = useState<string | null>(null)

  // If parent doesn't provide cartCount, read from client cart hook
  const { cartItems } = useCartData()
  const displayCartCount = typeof cartCount === "number" && cartCount > 0 ? cartCount : (cartItems?.length || 0)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    try {
      const rid = localStorage.getItem("recent_order_id")
      if (rid) setRecentOrderId(rid)
    } catch { }
  }, [])

  const navigation = [
    { name: "Home", href: "/", icon: IconHome },
    { name: "Shop", href: "/shop", icon: IconShoppingCart },
    { name: "Categories", href: "/categories", icon: IconCategory2 },
    { name: "Contact", href: "/contact", icon: IconMessage },
  ]

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/50 dark:bg-gray-900/50 backdrop-blur-md shadow-lg shadow-black/5"
          : "bg-white/80 dark:bg-transparent"
        } md:top-4 md:inset-x-4 lg:inset-x-20 xl:inset-x-40 md:rounded-2xl`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 md:h-20 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon.svg" alt="Luxe Logo" className="h-8 w-8" />
            <span className="hidden sm:block font-bold text-xl lg:text-2xl">Luxe</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-sm font-medium text-foreground/70 hover:text-foreground dark:text-gray-300 dark:hover:text-white transition-colors group"
              >
                <span className="flex items-center gap-1.5">
                  <item.icon className="h-5 w-5" />
                  <h6 className="font-semibold">{item.name}</h6>
                </span>
                {pathname === item.href && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute -bottom-1 inset-x-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search - Hidden on mobile */}
            <div className="hidden lg:block">
              <SearchBar />
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <AnimatedThemeToggler />
            )}

            {/* Recent Order */}
            {mounted && recentOrderId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/orders/${recentOrderId}`)}
                className="relative rounded-full h-9 w-9 hidden sm:flex"
              >
                <IconPackage className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-blue-500" />
              </Button>
            )}

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9">
                <IconShoppingCart className="h-5 w-5" />
                {displayCartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 p-0 flex items-center justify-center text-xs">
                    {displayCartCount > 9 ? "9+" : displayCartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <IconMenuDeep className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 sm:w-[320px] p-6">
                <VisuallyHidden>
                  <SheetTitle>Menu</SheetTitle>
                </VisuallyHidden>

                {/* Mobile Search */}
                <div className="lg:hidden mt-6 mb-8">
                  <SearchBar />
                </div>

                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 text-base font-medium py-2 transition-colors ${pathname === item.href
                          ? "text-primary"
                          : "text-foreground/70 dark:text-gray-200 hover:text-primary"
                        }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}

                  {/* Mobile Recent Order Link */}
                  {recentOrderId && (
                    <Link
                      href={`/orders/${recentOrderId}`}
                      className="flex items-center gap-3 text-base font-medium py-2 text-foreground/70 dark:text-gray-200 hover:text-primary transition-colors sm:hidden"
                    >
                      <IconPackage className="h-5 w-5" />
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
  )
}