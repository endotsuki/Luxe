"use client"

import type React from "react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import type { Product } from "@/lib/types"
import Image from "next/image"
import { sizedImage } from "@/lib/utils"

interface ProductDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isPreviewMode?: boolean
}

export function ProductDialog({
  product,
  open,
  onOpenChange,
  isPreviewMode = false,
}: ProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    compare_at_price: "",
    category_id: "",
    image_files: [] as File[], // ✅ Multiple FILES
    stock: "",
    is_active: true,
  })

  /* ---------------- Fetch categories ---------------- */
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error)
  }, [])

  /* ---------------- Populate form on edit ---------------- */
  useEffect(() => {
    if (!product) {
      setFormData({
        name: "",
        slug: "",
        description: "",
        price: "",
        compare_at_price: "",
        category_id: "",
        image_files: [],
        stock: "",
        is_active: true,
      })
      setExistingImages([])
      return
    }

    // Collect all existing images
    const allImages: string[] = []
    if (product.image_url) allImages.push(product.image_url)
    if (product.additional_images && Array.isArray(product.additional_images)) {
      allImages.push(...product.additional_images)
    }
    setExistingImages(allImages)

    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: String(product.price),
      compare_at_price: product.compare_at_price
        ? String(product.compare_at_price)
        : "",
      category_id: product.category_id ?? "",
      image_files: [],
      stock: String(product.stock),
      is_active: product.is_active,
    })
  }, [product, open])

  /* ---------------- Helpers ---------------- */
  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }))
  }

  /* ---------------- Submit ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const form = new FormData()

      form.append("name", formData.name)
      form.append("slug", formData.slug)
      form.append("description", formData.description)
      form.append("price", formData.price)
      form.append("compare_at_price", formData.compare_at_price)
      form.append("category_id", formData.category_id)
      form.append("stock", formData.stock)
      form.append("is_active", String(formData.is_active))

      // Handle multiple images
      if (formData.image_files.length > 0) {
        // User uploaded new images
        formData.image_files.forEach((file) => {
          form.append("images", file)
        })
      } else if (existingImages.length > 0 && product) {
        // User didn't upload new images, preserve existing ones
        form.append("existingImages", JSON.stringify(existingImages))
      }

      const url = product ? `/api/products/${product.id}` : "/api/products"
      const method = product ? "PUT" : "POST"
      console.log("Submitting to:", url, "Method:", method)

      const response = await fetch(url, {
        method: method,
        body: form,
      })

      const responseText = await response.text()
      console.log("Response status:", response.status)
      console.log("Response text:", responseText)

      if (!response.ok) {
        try {
          const error = JSON.parse(responseText)
          throw new Error(error?.error || `Server error: ${response.status}`)
        } catch {
          throw new Error(`Server error: ${response.status} - ${responseText}`)
        }
      }

      // Call parent's onOpenChange with true to trigger refresh
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save product"
      console.error("Error saving product:", error)
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- UI ---------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update product information"
              : "Create a new product for your store"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isPreviewMode}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                disabled={isPreviewMode}
                readOnly
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={isPreviewMode}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                disabled={isPreviewMode}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Compare At Price</Label>
              <Input
                type="number"
                value={formData.compare_at_price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    compare_at_price: e.target.value,
                  })
                }
                disabled={isPreviewMode}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                disabled={isPreviewMode}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) =>
                setFormData({ ...formData, category_id: value })
              }
              disabled={isPreviewMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ✅ MULTIPLE IMAGE INPUT */}
          <div className="space-y-2">
            <Label>Product Images</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              disabled={isPreviewMode}
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                setFormData({
                  ...formData,
                  image_files: files,
                })
              }}
            />
            <p className="text-xs text-muted-foreground">
              Upload one or more images. First image will be the main product image.
            </p>
          </div>

          {/* Existing Images Preview */}
          {existingImages.length > 0 && formData.image_files.length === 0 && (
            <div className="space-y-2">
              <Label>Current Images</Label>
              <div className="grid grid-cols-4 gap-2">
                {existingImages.map((imgUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={sizedImage(imgUrl, 400)}
                      alt={`Existing ${index}`}
                      className="w-full h-20 object-cover rounded-md border"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-md flex items-center justify-center transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = existingImages.filter((_, i) => i !== index)
                          setExistingImages(newImages)
                        }}
                        className="text-white text-xs bg-red-500 px-2 py-1 rounded-sm"
                      >
                        Remove
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-sm">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload new images to replace these, or click Remove to delete specific images.
              </p>
            </div>
          )}

          {/* New Images Preview */}
          {formData.image_files.length > 0 && (
            <div className="space-y-2">
              <Label>New Images to Upload</Label>
              <div className="grid grid-cols-4 gap-2">
                {formData.image_files.map((file, index) => (
                  <div key={index} className="relative group w-full h-20 overflow-hidden rounded-md border">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-md"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-md flex items-center justify-center transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = formData.image_files.filter((_, i) => i !== index)
                          setFormData({ ...formData, image_files: newFiles })
                        }}
                        className="text-white text-xs bg-red-500 px-2 py-1 rounded"
                      >
                        Remove
                      </button>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
              disabled={isPreviewMode}
            />
            <Label>Active</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {isPreviewMode ? "Close" : "Cancel"}
            </Button>
            {!isPreviewMode && (
              <Button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : product
                    ? "Update Product"
                    : "Create Product"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
