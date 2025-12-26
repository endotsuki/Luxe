import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();

    const images = formData.getAll("images") as File[];
    let imageName: string | null = null;
    const additionalImages: string[] = [];

    if (images.length > 0) {
      const uploadDir = path.join(process.cwd(), "public", "images");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      // Process all images and create resized versions
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const id = randomUUID();
        const originalName = `${id}.webp`;
        const name1080 = `${id}_1080.webp`;
        const name400 = `${id}_400.webp`;
        const name48 = `${id}_48.webp`;

        // Save original as WebP
        await sharp(buffer).webp({ quality: 80 }).toFile(path.join(uploadDir, originalName));

        // Create square resized versions (center-crop)
        await sharp(buffer)
          .resize(1080, 1080, { fit: "cover", position: "centre", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, name1080));

        await sharp(buffer)
          .resize(400, 400, { fit: "cover", position: "centre", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, name400));

        await sharp(buffer)
          .resize(48, 48, { fit: "cover", position: "centre", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(path.join(uploadDir, name48));

        // Store the 1080 version filename in DB references (main and additional)
        if (i === 0) {
          imageName = name1080;
        } else {
          additionalImages.push(name1080);
        }
      }
    }

    const product = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      price: Number(formData.get("price")),
      compare_at_price: formData.get("compare_at_price")
        ? Number(formData.get("compare_at_price"))
        : null,
      category_id: formData.get("category_id") || null,
      image_url: imageName,
      additional_images: additionalImages.length > 0 ? additionalImages : null,
      stock: Number(formData.get("stock")),
      is_active: formData.get("is_active") === "true",
    };

    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// GET - fetch related products
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const exclude = searchParams.get("exclude");
    const limit = Number(searchParams.get("limit") || 10);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", category)
      .neq("id", exclude)
      .eq("is_active", true)
      .limit(limit);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching related products:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
