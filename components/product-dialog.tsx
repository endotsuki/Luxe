"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { Product } from "@/lib/types"
import { ImagePreview } from "./image-preview"
import { fixImageOrientation } from "@/lib/image-utils"
import { useProductForm } from "@/hooks/useProductForm"

interface ProductDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isPreviewMode?: boolean
}

export function ProductDialog({ product, open, onOpenChange, isPreviewMode = false }: ProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const { formData, existingImages, setFormData, setExistingImages, handleNameChange, resetForm } = useProductForm(product, open)

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories).catch(console.error)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const form = new FormData()
      for (const [k, v] of Object.entries(formData)) {
        if (k === "image_files") {
          const files = v as File[]
          if (files.length > 0) {
            // fix orientation for each file before upload
            const corrected = await Promise.all(files.map((f) => fixImageOrientation(f)))
            corrected.forEach((f) => form.append("images", f))
          } else if (existingImages.length > 0 && product) {
            form.append("existingImages", JSON.stringify(existingImages))
          }
        } else {
          form.append(k, String(v))
        }
      }

      const url = product ? `/api/products/${product.id}` : "/api/products"
      const res = await fetch(url, { method: product ? "PUT" : "POST", body: form })
      const txt = await res.text()

      if (!res.ok) {
        try {
          const err = JSON.parse(txt)
          throw new Error(err?.error || `Server error: ${res.status}`)
        } catch {
          throw new Error(`Server error: ${res.status} - ${txt}`)
        }
      }
      onOpenChange(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>{product ? "Update product information" : "Create a new product for your store"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input value={formData.name} onChange={e => handleNameChange(e.target.value)} disabled={isPreviewMode} required />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={formData.slug} disabled={isPreviewMode} readOnly required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} disabled={isPreviewMode} rows={3} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} disabled={isPreviewMode} required />
            </div>
            <div className="space-y-2">
              <Label>Compare At Price</Label>
              <Input type="number" value={formData.compare_at_price} onChange={e => setFormData({ ...formData, compare_at_price: e.target.value })} disabled={isPreviewMode} />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} disabled={isPreviewMode} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category_id} onValueChange={v => setFormData({ ...formData, category_id: v })} disabled={isPreviewMode}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <Input type="file" accept="image/*" multiple disabled={isPreviewMode} onChange={e => setFormData({ ...formData, image_files: Array.from(e.target.files || []) })} />
            <p className="text-xs text-muted-foreground">Upload one or more images. First image will be the main product image.</p>
          </div>

          <ImagePreview 
            existingImages={existingImages} 
            newImages={formData.image_files} 
            onRemoveExisting={idx => setExistingImages(existingImages.filter((_, i) => i !== idx))}
            onRemoveNew={idx => setFormData({ ...formData, image_files: formData.image_files.filter((_, i) => i !== idx) })}
            isPreviewMode={isPreviewMode}
          />

          <div className="flex items-center space-x-2">
            <Switch checked={formData.is_active} onCheckedChange={checked => setFormData({ ...formData, is_active: checked })} disabled={isPreviewMode} />
            <Label>Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{isPreviewMode ? "Close" : "Cancel"}</Button>
            {!isPreviewMode && <Button type="submit" disabled={loading}>{loading ? "Saving..." : product ? "Update Product" : "Create Product"}</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}