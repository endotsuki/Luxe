import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"

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

    // Parse JSON payload (Cloudinary URLs are already uploaded)
    const body = await req.json()

    // Build update object
    const updateData: any = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: Number(body.price),
      compare_at_price: body.compare_at_price
        ? Number(body.compare_at_price)
        : null,
      category_id: body.category_id || null,
      stock: Number(body.stock),
      is_active: body.is_active === true || body.is_active === "true",
    }

    // Handle image URLs from Cloudinary
    const image_urls = (body.image_urls || []) as string[]
    
    if (image_urls.length > 0) {
      // User uploaded new images to Cloudinary
      updateData.image_url = image_urls[0]
      if (image_urls.length > 1) {
        updateData.additional_images = image_urls.slice(1)
      } else {
        updateData.additional_images = null
      }
    }
    // If no image_urls provided, keep existing images (no update to image fields)

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
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

/**
 * Extract public_id from Cloudinary URL
 * @param cloudinaryUrl - The secure URL from Cloudinary
 * @returns The public_id extracted from the URL
 */
function extractCloudinaryPublicId(cloudinaryUrl: string): string | null {
  try {
    // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    const urlParts = cloudinaryUrl.split("/")
    const lastPart = urlParts[urlParts.length - 1] // e.g., "abc123.webp"
    const publicId = lastPart.split(".")[0] // Remove extension
    return publicId
  } catch {
    return null
  }
}

/**
 * Delete image from Cloudinary using Admin API with signature
 */
async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Missing Cloudinary environment variables (CLOUD_NAME, API_KEY, API_SECRET)")
    return false
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000)
    const params = `public_id=${publicId}&timestamp=${timestamp}`
    
    // Generate signature for secure API call
    const signature = crypto
      .createHash("sha256")
      .update(params + apiSecret)
      .digest("hex")

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        public_id: publicId,
        api_key: apiKey,
        timestamp: timestamp.toString(),
        signature: signature,
      }).toString(),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error(`Cloudinary delete error for ${publicId}:`, responseData)
      return false
    }

    if (responseData.result === "ok") {
      console.log(`Successfully deleted image from Cloudinary: ${publicId}`)
      return true
    } else {
      console.error(`Cloudinary delete result not ok for ${publicId}:`, responseData)
      return false
    }
  } catch (err) {
    console.error(`Failed to delete image from Cloudinary (${publicId}):`, err)
    return false
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

    // 1. Fetch product to get all image URLs from Cloudinary
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("image_url, additional_images")
      .eq("id", id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // 2. Delete all images from Cloudinary
    const imagesToDelete = [
      product.image_url,
      ...(product.additional_images || [])
    ].filter(Boolean)

    console.log(`Deleting ${imagesToDelete.length} images from Cloudinary for product ${id}`)

    for (const imageUrl of imagesToDelete) {
      try {
        const publicId = extractCloudinaryPublicId(imageUrl)
        if (publicId) {
          await deleteFromCloudinary(publicId)
        } else {
          console.warn(`Could not extract public_id from URL: ${imageUrl}`)
        }
      } catch (err) {
        console.error("Error processing image deletion:", err)
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
