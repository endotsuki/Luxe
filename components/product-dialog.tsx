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

interface ProductDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDialog({
  product,
  open,
  onOpenChange,
}: ProductDialogProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<
    { id: string; name: string; slug: string }[]
  >([])

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    compare_at_price: "",
    category_id: "",
    image_file: null as File | null, // ✅ FILE
    additional_images: "",
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
        image_file: null,
        additional_images: "",
        stock: "",
        is_active: true,
      })
      return
    }

    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: String(product.price),
      compare_at_price: product.compare_at_price
        ? String(product.compare_at_price)
        : "",
      category_id: product.category_id ?? "",
      image_file: null, // 👈 keep existing image unless replaced
      additional_images: product.additional_images?.join(", ") ?? "",
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

      if (formData.image_file) {
        form.append("image", formData.image_file) // ✅ FILE
      }

      const additional_images =
        formData.additional_images
          ?.split(",")
          .map((img) => img.trim())
          .filter(Boolean) ?? []

      form.append(
        "additional_images",
        JSON.stringify(additional_images)
      )

      const response = await fetch(
        product ? `/api/products/${product?.id}` : "/api/products",
        {
          method: product ? "PUT" : "POST",
          body: form, // ❌ no Content-Type
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error?.error || "Failed to save product")
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Failed to save product")
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
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
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
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
            <Input
              type="number"
              placeholder="Compare Price"
              value={formData.compare_at_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  compare_at_price: e.target.value,
                })
              }
            />
            <Input
              type="number"
              placeholder="Stock"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              required
            />
          </div>

          <Select
            value={formData.category_id}
            onValueChange={(value) =>
              setFormData({ ...formData, category_id: value })
            }
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

          {/* ✅ FILE INPUT */}
          <div className="space-y-2">
            <Label>Main Image</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  image_file: e.target.files?.[0] || null,
                })
              }
            />
          </div>

          <Textarea
            placeholder="Additional image URLs (comma separated)"
            value={formData.additional_images}
            onChange={(e) =>
              setFormData({
                ...formData,
                additional_images: e.target.value,
              })
            }
            rows={2}
          />

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
            <Label>Active</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : product
                ? "Update Product"
                : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
