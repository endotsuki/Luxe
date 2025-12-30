import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadImageToSupabase } from "@/lib/supabase-upload";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();

    // Extract form fields
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const compare_at_price = formData.get("compare_at_price")
      ? Number(formData.get("compare_at_price"))
      : null;
    const category_id = (formData.get("category_id") as string) || null;
    const stock = Number(formData.get("stock"));
    const is_active = formData.get("is_active") === "true";

    // Validate required fields
    if (!name || !slug || !price) {
      return NextResponse.json(
        { error: "Name, slug, and price are required" },
        { status: 400 }
      );
    }

    // Upload images to Supabase Storage
    const images = formData.getAll("images") as File[];
    let image_url: string | null = null;
    const additional_images: string[] = [];

    if (images.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    for (let i = 0; i < images.length; i++) {
      const uploadedImage = await uploadImageToSupabase(images[i], supabase);

      if (i === 0) {
        image_url = uploadedImage.url;
      } else {
        additional_images.push(uploadedImage.url);
      }
    }

    // Insert product into database
    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name,
          slug,
          description,
          price,
          compare_at_price,
          category_id,
          stock,
          is_active,
          image_url,
          additional_images: additional_images.length > 0 ? additional_images : null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create product" },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
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
