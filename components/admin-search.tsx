"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { IconSearch, IconX, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

interface AdminSearchProps {
  onSearch: (q: string) => void
  placeholder?: string
}

export function AdminSearch({ onSearch, placeholder = 'Search orders or products...' }: AdminSearchProps) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const tRef = useRef<number | null>(null)

  useEffect(() => {
    setLoading(true)
    if (tRef.current) window.clearTimeout(tRef.current)
    tRef.current = window.setTimeout(() => {
      onSearch(query.trim())
      setLoading(false)
    }, 250)
    return () => {
      if (tRef.current) window.clearTimeout(tRef.current)
    }
  }, [query, onSearch])

  const clear = () => {
    setQuery("")
    onSearch("")
  }

  return (
    <div className="w-full max-w-lg">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {loading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconSearch className="h-4 w-4" />}
        </div>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className="pl-10 pr-10 h-11 rounded-full" />
        {query && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Button variant="ghost" size="icon" onClick={clear} className="h-8 w-8">
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
