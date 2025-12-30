import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { uploadImageToSupabase, deleteImageFromSupabase } from "@/lib/supabase-upload"

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
      // User uploaded new images to Supabase Storage
      for (let i = 0; i < images.length; i++) {
        const uploadedImage = await uploadImageToSupabase(images[i], supabase)
        if (i === 0) {
          updateData.image_url = uploadedImage.url
        } else {
          additionalImages.push(uploadedImage.url)
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
      // Extract filename from URL and delete from Supabase Storage
      try {
        const url = new URL(filename)
        const urlFilename = url.pathname.split("/").pop()
        if (urlFilename) {
          await deleteImageFromSupabase(urlFilename, supabase)
        }
      } catch {
        // Ignore parse errors
      }
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
