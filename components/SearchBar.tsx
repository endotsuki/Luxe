"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { IconSearch, IconShoppingCartOff, IconX, IconLoader2 } from "@tabler/icons-react"
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
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!query) return setResults([]), setOpen(false)
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?query=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data)
        setOpen(true)
      } catch (err) {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && (setOpen(false), setFocused(false))
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])

  const clear = () => (setQuery(""), setResults([]), setOpen(false), inputRef.current?.focus())

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <div className={`relative flex items-center transition-all ${focused ? 'ring-2 ring-primary/20 rounded-2xl' : ''}`}>
        <div className="absolute left-4">
          {loading ? <IconLoader2 className="h-5 w-5 text-muted-foreground animate-spin" /> : <IconSearch className="h-5 w-5 text-muted-foreground" />}
        </div>
        <Input ref={inputRef} placeholder="Search products..." value={query} onChange={e => setQuery(e.target.value)} onFocus={() => setFocused(true)} className="flex-1 rounded-2xl pl-12 pr-12 h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60" />
        <AnimatePresence>
          {query && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute right-3">
              <Button variant="ghost" size="icon" onClick={clear} className="h-7 w-7 rounded-full hover:bg-muted">
                <IconX className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.15 }} className="absolute z-50 mt-2 w-full bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden">
            {!loading && results.length > 0 && (
              <div className="px-4 py-2 border-b border-border/50">
                <p className="text-xs font-medium text-muted-foreground">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
              </div>
            )}
            
            <div className="max-h-100 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30">
              {!loading && results.length > 0 ? results.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link href={p.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all group" onClick={() => (setOpen(false), setFocused(false))}>
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted hrink-0 ring-1 ring-border/50">
                      <Image src={p.image ? sizedImage(p.image, 400) : "/placeholder.svg"} alt={p.name} width={56} height={56} className="object-cover group-hover:scale-110 transition-transform duration-300" loading="eager" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h6 className="text-sm font-medium truncate group-hover:text-primary transition-colors">{p.name}</h6>
                      <p className="text-sm font-semibold text-primary mt-0.5">${p.price.toFixed(2)}</p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )) : !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <IconShoppingCartOff className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-semibold mb-1">No products found</h3>
                  <p className="text-sm text-muted-foreground">Try different keywords</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}