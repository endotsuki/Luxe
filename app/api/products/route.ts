import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { randomUUID } from "crypto"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const formData = await request.formData()

    /* ---------- Handle image ---------- */
    const image = formData.get("image") as File | null
    let imageName: string | null = null

    if (image) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = path.join(process.cwd(), "public", "images")

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      imageName = `${randomUUID()}-${image.name}`
      fs.writeFileSync(path.join(uploadDir, imageName), buffer)
    }

    /* ---------- Build product object ---------- */
    const product = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      compare_at_price: formData.get("compare_at_price")
        ? Number(formData.get("compare_at_price"))
        : null,
      category_id: formData.get("category_id") || null,
      image_url: imageName, // ✅ only filename
      additional_images: JSON.parse(
        (formData.get("additional_images") as string) || "[]"
      ),
      stock: Number(formData.get("stock")),
      is_active: formData.get("is_active") === "true",
    }

    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("SERVER ERROR:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}
