import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"
import sharp from "sharp"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const formData = await req.formData()

    // Build update object
    const updateData: any = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      compare_at_price: formData.get("compare_at_price")
        ? Number(formData.get("compare_at_price"))
        : null,
      category_id: formData.get("category_id") || null,
      stock: Number(formData.get("stock")),
      is_active: formData.get("is_active") === "true",
    }

    // Handle multiple image uploads or preserve existing images
    const images = formData.getAll("images") as File[]
    const existingImagesJson = formData.get("existingImages") as string | null
    const additionalImages: string[] = []
    
    if (images.length > 0) {
      // Get old images to delete them
      const { data: oldProduct } = await supabase
        .from("products")
        .select("image_url, additional_images")
        .eq("id", id)
        .single()

      // Delete old images from storage
      if (oldProduct?.image_url) {
        await supabase.storage.from('product-images').remove([oldProduct.image_url])
      }
      if (oldProduct?.additional_images) {
        await supabase.storage.from('product-images').remove(oldProduct.additional_images)
      }

      // Upload new images
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const buffer = Buffer.from(await image.arrayBuffer())
        
        // Convert to WebP and compress
        const webpBuffer = await sharp(buffer)
          .webp({ quality: 80 })
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .toBuffer()

        const fileName = `${randomUUID()}.webp`
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, webpBuffer, {
            contentType: 'image/webp',
            cacheControl: '3600',
          })

        if (uploadError) {
          throw new Error(`Failed to upload image: ${uploadError.message}`)
        }

        // First image is main image
        if (i === 0) {
          updateData.image_url = fileName
        } else {
          additionalImages.push(fileName)
        }
      }

      // Update additional_images
      if (additionalImages.length > 0) {
        updateData.additional_images = additionalImages
      } else {
        updateData.additional_images = null
      }
    } else if (existingImagesJson) {
      // No new images, preserve existing ones
      const existingImages = JSON.parse(existingImagesJson) as string[]
      if (existingImages.length > 0) {
        updateData.image_url = existingImages[0]
        if (existingImages.length > 1) {
          updateData.additional_images = existingImages.slice(1)
        } else {
          updateData.additional_images = null
        }
      }
    }

    // Update product in Supabase
    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Failed to update product:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update product" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get product to delete images from storage
    const { data: product } = await supabase
      .from("products")
      .select("image_url, additional_images")
      .eq("id", id)
      .single()

    // Delete images from storage
    if (product?.image_url) {
      await supabase.storage.from('product-images').remove([product.image_url])
    }
    if (product?.additional_images) {
      await supabase.storage.from('product-images').remove(product.additional_images)
    }

    // Delete product from database
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Failed to delete product:", err)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}