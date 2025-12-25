"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { SearchBar } from "./SearchBar"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { SheetTitle } from "@/components/ui/sheet"
import { IconMoon, IconShoppingCart, IconSun, IconHome, IconCategory2, IconMessage, IconMenuDeep, IconPackage } from "@tabler/icons-react"
import { useRouter } from "next/navigation"

interface SiteHeaderProps {
  cartCount?: number
}

export function SiteHeader({ cartCount = 0 }: SiteHeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [recentOrderId, setRecentOrderId] = useState<string | null>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    try {
      const rid = localStorage.getItem("recent_order_id")
      if (rid) setRecentOrderId(rid)
    } catch (e) {}
  }, [])

  const navigation = [
    { name: "Home", href: "/", icon: IconHome },
    { name: "Shop", href: "/shop", icon: IconShoppingCart },
    { name: "Categories", href: "/categories", icon: IconCategory2 },
    { name: "Contact", href: "/contact", icon: IconMessage },
  ]
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])


  return (
    <header
      className={`fixed top-2 inset-x-60 rounded-2xl z-50 w-auto transition-all duration-300 backdrop-blur-lg ${scrolled
          ? "bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
          : "bg-transparent top-4 border-none shadow-none"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/icon.svg" alt="LuxeAccessories Logo" className="h-7 w-7" />
            <h6 className="hidden font-bold text-2xl sm:inline-block">
              Luxe
            </h6>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-12 relative">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <h6 key={item.name}>
                  <Link
                    href={item.href}
                    className="relative text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                  >
                    {item.icon && (
                      <item.icon className="inline-block mr-1 mb-1 h-5 w-5" />
                    )}
                    {item.name}

                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </h6>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* Theme Toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === "dark" ? <IconSun className="h-5 w-5 text-yellow-400" /> : <IconMoon className="h-5 w-5 text-gray-700 dark:text-gray-300" />}
              </Button>
            )}

            {/* View Order */}
            {mounted && recentOrderId && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push(`/orders/${recentOrderId}`)}
                className="relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="View your recent order"
              >
                <IconPackage className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-blue-500 text-white p-0 flex items-center justify-center text-xs">
                  •
                </Badge>
              </Button>
            )}

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <IconShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                {cartCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 text-white p-0 flex items-center justify-center text-xs animate-pulse">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <IconMenuDeep className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-70 sm:w-90 p-6">
                <VisuallyHidden>
                  <SheetTitle>Mobile Navigation</SheetTitle>
                </VisuallyHidden>

                <nav className="flex flex-col gap-6 mt-4">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`text-lg font-semibold transition-colors ${isActive
                          ? "text-primary"
                          : "text-gray-700 dark:text-gray-200 hover:text-primary"
                          }`}
                      >
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
