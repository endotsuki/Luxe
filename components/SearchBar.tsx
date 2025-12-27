"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { IconArrowUpRight, IconSearch, IconShoppingCartOff } from "@tabler/icons-react"
import { sizedImage } from "@/lib/utils"

interface Product {
  id: string
  name: string
  price: number
  image: string
  href: string
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch products from Supabase search API
  useEffect(() => {
    if (!query) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?query=${encodeURIComponent(query)}`)
        if (!res.ok) throw new Error("Failed to fetch products")

        const data: Product[] = await res.json()
        setResults(data)
        setOpen(true)
      } catch (err) {
        console.error("Search error:", err)
        setResults([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 300) // debounce 300ms

    return () => clearTimeout(timeout)
  }, [query])

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative w-64" ref={containerRef}>
      {/* Input */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border-gray-300 dark:border-gray-500/50 focus:ring-2  transition-all"
        />
        <Button
          variant={"outline"}
          aria-label="Search"
        >
          <IconSearch className="h-5 w-5" />
        </Button>
      </div>


      {/* Results dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg overflow-hidden"
          >
            {loading && (
              <div className="p-2 text-gray-500 dark:text-gray-400 text-sm">
                Loading...
              </div>
            )}

            {!loading && results.length > 0 && (
              results.map((product) => (
                <Link
                  key={product.id}
                  href={product.href}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <div className="relative w-12 h-12 rounded overflow-hidden bg-muted">
                    <Image
                      src={product.image ? sizedImage(product.image, 48) : "/placeholder.svg"}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="object-cover"
                      loading="eager"
                    />
                  </div>
                  <div>
                    <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {product.name}
                    </h6>
                    <h6 className="text-sm text-gray-500 dark:text-gray-400">
                      ${product.price.toFixed(2)}
                    </h6>
                  </div>
                  <IconArrowUpRight className="ml-auto h-5 w-5 text-gray-400" />
                </Link>
              ))
            )}

            {!loading && results.length === 0 && (
              <div className="flex flex-col items-center justify-center p-2 text-center text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <IconShoppingCartOff className="h-12 w-12 mb-4 text-gray-400 dark:text-gray-500" />
                <h3 className="text-lg font-semibold mb-1">No products found</h3>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
