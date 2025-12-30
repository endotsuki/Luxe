import sharp from "sharp"
import { randomUUID } from "crypto"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export interface UploadedImage {
  url: string
  filename: string
}

/**
 * Upload image to Supabase Storage bucket 'product-images'
 * Resizes and converts to WebP format
 * Returns public URL and filename
 */
export async function uploadImageToSupabase(
  file: File,
  supabase: any
): Promise<UploadedImage> {
  try {
    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    // Generate unique filename
    const id = randomUUID()
    const filename = `${id}.webp`

    // Resize and convert to WebP (1080px max width)
    const processedBuffer = await sharp(buffer)
      .resize(1080, 1080, {
        fit: "cover",
        position: "centre",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer()

    // Upload to Supabase Storage using provided client
    let uploadResult = await supabase.storage
      .from("product-images")
      .upload(filename, processedBuffer, {
        contentType: "image/webp",
        upsert: false,
      })

    // If upload failed due to permissions or bucket issues, retry with service role (server-side)
    if (uploadResult.error) {
      // Try service role client if available
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const admin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
            process.env.SUPABASE_SERVICE_ROLE_KEY
          )

          uploadResult = await admin.storage
            .from("product-images")
            .upload(filename, processedBuffer, {
              contentType: "image/webp",
              upsert: false,
            })
        } catch (e) {
          // ignore, will throw below
        }
      }
    }

    if (uploadResult.error) {
      throw new Error(`Upload failed: ${uploadResult.error.message}`)
    }

    // Get public URL (use admin client if created)
    let publicUrlResp: any = supabase.storage.from("product-images").getPublicUrl(filename)
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const admin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
      publicUrlResp = admin.storage.from("product-images").getPublicUrl(filename)
    }

    return {
      url: publicUrlResp.data?.publicUrl || publicUrlResp.publicUrl || "",
      filename: filename,
    }
  } catch (err) {
    console.error("Upload error:", err)
    throw err
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImageFromSupabase(
  filename: string,
  supabase: any
): Promise<void> {
  try {
    let result = await supabase.storage.from("product-images").remove([filename])

    if (result.error) {
      console.error("Delete error (initial):", result.error)
      // Retry with service role if available
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const admin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
            process.env.SUPABASE_SERVICE_ROLE_KEY
          )
          result = await admin.storage.from("product-images").remove([filename])
          if (result.error) {
            console.error("Delete error (admin):", result.error)
          }
        } catch (e) {
          console.error("Delete retry failed:", e)
        }
      }
    }
  } catch (err) {
    console.error("Delete failed:", err)
  }
}
