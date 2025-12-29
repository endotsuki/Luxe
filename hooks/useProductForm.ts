import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"

interface FormData {
  name: string
  slug: string
  description: string
  price: string
  compare_at_price: string
  category_id: string
  image_files: File[]
  stock: string
  is_active: boolean
}

const initialForm: FormData = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compare_at_price: "",
  category_id: "",
  image_files: [],
  stock: "",
  is_active: true,
}

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

export function useProductForm(product: Product | null, open: boolean) {
  const [formData, setFormData] = useState<FormData>(initialForm)
  const [existingImages, setExistingImages] = useState<string[]>([])

  useEffect(() => {
    if (!product) {
      setFormData(initialForm)
      setExistingImages([])
      return
    }

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
      compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
      category_id: product.category_id ?? "",
      image_files: [],
      stock: String(product.stock),
      is_active: product.is_active,
    })
  }, [product, open])

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value, slug: generateSlug(value) }))
  }

  const resetForm = () => {
    setFormData(initialForm)
    setExistingImages([])
  }

  return { formData, existingImages, setFormData, setExistingImages, handleNameChange, resetForm }
}