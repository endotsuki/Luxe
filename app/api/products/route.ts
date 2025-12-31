import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Parse JSON payload (Cloudinary URLs are already uploaded)
    const body = await request.json();

    // Extract form fields
    const name = body.name as string;
    const slug = body.slug as string;
    const description = body.description as string;
    const price = Number(body.price);
    const compare_at_price = body.compare_at_price
      ? Number(body.compare_at_price)
      : null;
    const category_id = body.category_id || null;
    const stock = Number(body.stock);
    const is_active = body.is_active === true || body.is_active === "true";
    const image_urls = (body.image_urls || []) as string[];

    // Validate required fields
    if (!name || !slug || !price) {
      return NextResponse.json(
        { error: "Name, slug, and price are required" },
        { status: 400 }
      );
    }

    // Validate at least one image URL from Cloudinary
    if (image_urls.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    // Store image URLs directly (already uploaded to Cloudinary)
    const image_url = image_urls[0];
    const additional_images = image_urls.slice(1);

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
