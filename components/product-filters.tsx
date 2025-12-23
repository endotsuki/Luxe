"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get("sort") || "newest"

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    router.push(`/shop?${params.toString()}`)
  }

  return (
    <Card className="py-6">
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Sort By</h3>
          <RadioGroup value={currentSort} onValueChange={handleSortChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="newest" />
              <Label htmlFor="newest" className="cursor-pointer">
                Newest
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price-asc" id="price-asc" />
              <Label htmlFor="price-asc" className="cursor-pointer">
                Price: Low to High
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="price-desc" id="price-desc" />
              <Label htmlFor="price-desc" className="cursor-pointer">
                Price: High to Low
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="name" id="name" />
              <Label htmlFor="name" className="cursor-pointer">
                Name
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  )
}
