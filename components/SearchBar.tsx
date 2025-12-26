"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { IconSearch } from "@tabler/icons-react"

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
            className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md overflow-hidden"
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
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ${product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))
            )}

            {!loading && results.length === 0 && (
              <div className="p-2 text-gray-500 dark:text-gray-400 text-sm">
                No products found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
