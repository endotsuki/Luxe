import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"
import sharp from "sharp"

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
      additional_images: JSON.parse((formData.get("additional_images") as string) || "[]"),
      stock: Number(formData.get("stock")),
      is_active: formData.get("is_active") === "true",
    }

    // Optional image upload
    const image = formData.get("image") as File | null
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer())
      // Convert to WebP
      const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer()

      const uploadDir = path.join(process.cwd(), "public", "images")
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

      const imageName = `${randomUUID()}.webp`
      fs.writeFileSync(path.join(uploadDir, imageName), webpBuffer)

      updateData.image_url = imageName
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
