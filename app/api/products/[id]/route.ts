import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"
import sharp from "sharp"

// Helper to delete image files from public folder
async function deleteImageFile(filename: string) {
  try {
    const uploadDir = path.join(process.cwd(), "public", "images")
    const filePath = path.join(uploadDir, filename)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (e) {
    console.error("Failed to delete image file:", e)
    // Don't throw - continue with product deletion
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check for valid product ID
    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Parse incoming form data
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
      // User uploaded new images, replace all
      const uploadDir = path.join(process.cwd(), "public", "images")
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

      // Process all images and create resized versions
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const buffer = Buffer.from(await image.arrayBuffer())

        const id = randomUUID()
        const originalName = `${id}.webp`
        const name1080 = `${id}_1080.webp`
        const name400 = `${id}_400.webp`
        const name48 = `${id}_48.webp`

        // Save original as WebP
        await sharp(buffer).webp({ quality: 80 }).toFile(path.join(uploadDir, originalName))

        // Create resized square versions
        await sharp(buffer)
          .resize(1080, 1080, { fit: "cover", position: "centre", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, name1080))

        await sharp(buffer)
          .resize(400, 400, { fit: "cover", position: "centre", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, name400))

        await sharp(buffer)
          .resize(48, 48, { fit: "cover", position: "centre", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, name48))

        // Use 1080 version for DB references
        if (i === 0) {
          updateData.image_url = name1080
        } else {
          additionalImages.push(name1080)
        }
      }

      // Only update additional_images if we have them
      if (additionalImages.length > 0) {
        updateData.additional_images = additionalImages
      }
    } else if (existingImagesJson) {
      // No new images, preserve existing ones
      const existingImages = JSON.parse(existingImagesJson) as string[]
      if (existingImages.length > 0) {
        updateData.image_url = existingImages[0]
        if (existingImages.length > 1) {
          updateData.additional_images = existingImages.slice(1)
        }
      }
    }

    // Update product in Supabase
    const { error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id) // Use awaited id

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Failed to update product:", err)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// Delete handler - removes product and associated image files
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

    // 1. Fetch product to get all image filenames
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("image_url, additional_images")
      .eq("id", id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // 2. Delete all image files from public/images folder
    const imagesToDelete = [
      product.image_url,
      ...(product.additional_images || [])
    ].filter(Boolean)

    for (const filename of imagesToDelete) {
      // Delete all size variants of the image
      const base = filename.replace(/_1080\.webp$|_400\.webp$|_48\.webp$|\.webp$/, "")
      await deleteImageFile(`${base}.webp`)
      await deleteImageFile(`${base}_1080.webp`)
      await deleteImageFile(`${base}_400.webp`)
      await deleteImageFile(`${base}_48.webp`)
    }

    // 3. Delete product from database
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id)

    if (deleteError) {
      console.error("Delete error:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
